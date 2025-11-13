import { withErrorHandling } from "@/lib/errors/errorHandlers";
import { prisma } from "@/lib/prisma";
import stripe from "@/lib/stripe/stripe-admin";
import {
  createBillingPortalSessionSchema,
  createCheckoutSessionSchema,
  createStripeCustomerSchema,
} from "./stripeValidators";
import {
  createBillingPortalSessionParams,
  createCheckoutSessionParams,
  CreateStripeCustomerParams,
} from "@/lib/types/stripeTypes";
import { InternalServerError, NotFoundError } from "@/lib/errors/apiErrors";
import Stripe from "stripe";
import { UserService } from "@/services/user/userService";

export class StripeService {
  /**
   * Create a Stripe customer for a user and store the customer ID
   */
  public getOrCreateStripeCustomer = withErrorHandling(
    async (params: CreateStripeCustomerParams): Promise<string> => {
      const { userId, email } = createStripeCustomerSchema.parse(params);

      // Check if user already has a Stripe customer ID
      const existingUser = await prisma.app_user.findUnique({
        where: { id: userId },
        select: {
          stripe_customer_id: true,
          email: true,
          first_name: true,
          last_name: true,
        },
      });

      if (!existingUser) {
        throw new NotFoundError(`User with ID ${userId} not found`);
      }

      if (existingUser.stripe_customer_id) {
        return existingUser.stripe_customer_id;
      }

      // Create Stripe customer
      const customer = await stripe.customers.create({
        email,
        name: `${existingUser.first_name} ${existingUser.last_name}`,
        metadata: {
          user_id: userId,
        },
      });

      // Store customer ID in database
      await prisma.app_user.update({
        where: { id: userId },
        data: { stripe_customer_id: customer.id },
      });

      return customer.id;
    }
  );

  /**
   * Create a billing portal session which enables a user to manage their subscription via stripe
   */
  public createBillingPortalSession = withErrorHandling(
    async (
      params: createBillingPortalSessionParams
    ): Promise<Stripe.BillingPortal.Session> => {
      // validate params
      const { returnUrl, stripeCustomerId } =
        createBillingPortalSessionSchema.parse(params);
      // ensure the env var exists
      if (!process.env.STRIPE_BILLING_PORTAL_CONFIGURATION) {
        throw new InternalServerError(
          "STRIPE_BILLING_PORTAL_CONFIGURATION is not set and required to create a billing portal session"
        );
      }
      // create the session
      const portalSession = await stripe.billingPortal.sessions.create({
        configuration: process.env.STRIPE_BILLING_PORTAL_CONFIGURATION,
        customer: stripeCustomerId,
        return_url: returnUrl,
      });
      return portalSession;
    }
  );

  /**
   * Create a checkout session which enables a user to subscribe to our product via stripe
   */
  public createCheckoutSession = withErrorHandling(
    async (
      params: createCheckoutSessionParams
    ): Promise<Stripe.Checkout.Session> => {
      // validate params
      const { stripeCustomerId, userId, returnUrl } =
        createCheckoutSessionSchema.parse(params);
      // ensure the env var exists
      if (!process.env.STRIPE_PRO_PRICE_ID) {
        throw new InternalServerError(
          "STRIPE_PRO_PRICE_ID is not set and required to create a checkout session"
        );
      }
      // create the session
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        // payment_method_types: ["card", "link"],
        mode: "subscription",
        line_items: [
          {
            price: process.env.STRIPE_PRO_PRICE_ID!,
            quantity: 1,
          },
        ],
        success_url: `${returnUrl}?upgrade=success`,
        cancel_url: `${returnUrl}/?upgrade=canceled`,
        metadata: {
          user_id: userId,
          tier: "PRO",
        },
      });
      return session;
    }
  );

  /**
   * Process Stripe webhook events
   */
  public processWebhookEvent = withErrorHandling(
    async (event: Stripe.Event): Promise<void> => {
      console.log(`Processing webhook event: ${event.type}`);

      switch (event.type) {
        case "customer.subscription.created":
          await this.handleSubscriptionCreated(
            event.data.object as Stripe.Subscription
          );
          break;

        case "customer.subscription.updated":
          await this.handleSubscriptionUpdated(
            event.data.object as Stripe.Subscription
          );
          break;

        case "customer.subscription.deleted":
          await this.handleSubscriptionDeleted(
            event.data.object as Stripe.Subscription
          );
          break;

        case "invoice.paid":
          await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
          break;

        case "invoice.payment_failed":
          await this.handleInvoicePaymentFailed(
            event.data.object as Stripe.Invoice
          );
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    }
  );

  /**
   * Handle new subscription creation
   */
  private handleSubscriptionCreated = withErrorHandling(
    async (subscription: Stripe.Subscription): Promise<void> => {
      console.log("subscription created", JSON.stringify(subscription));
      const userService = new UserService();

      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const user = await userService.findUserByStripeCustomerId(customerId);
      if (!user) {
        throw new NotFoundError(
          `No user found for Stripe customer ID: ${customerId}`
        );
      }

      console.log(`Activating subscription for user ${user.id}`);

      // Get current_period_end from the subscription item (Stripe timestamps are in seconds, JS Date expects milliseconds)
      const currentPeriodEnd = (subscription.items.data[0] as any)
        ?.current_period_end;
      if (!currentPeriodEnd) {
        throw new InternalServerError(
          "Subscription is missing required current_period_end data"
        );
      }

      await userService.updateUserSubscriptionFromStripe({
        userId: user.id,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price.id || null,
        tier: "PRO",
        endDate: new Date(currentPeriodEnd * 1000),
      });
    }
  );

  /**
   * Handle subscription updates (plan changes, reactivations, etc.)
   */
  private handleSubscriptionUpdated = withErrorHandling(
    async (subscription: Stripe.Subscription): Promise<void> => {
      console.log("subscription updated", JSON.stringify(subscription));
      const userService = new UserService();

      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const user = await userService.findUserByStripeCustomerId(customerId);
      if (!user) {
        throw new NotFoundError(
          `No user found for Stripe customer ID: ${customerId}`
        );
      }

      // Get current subscription state to validate this is the active subscription
      const currentSubscription = await userService.getUserSubscription(
        user.id
      );

      // Only process if this is the user's current active subscription or they have no subscription
      if (
        currentSubscription.stripe_subscription_id === subscription.id ||
        !currentSubscription.stripe_subscription_id
      ) {
        console.log(
          `Updating subscription for user ${user.id}, status: ${subscription.status}`
        );

        // Get current_period_end from the subscription item
        const currentPeriodEnd = (subscription.items.data[0] as any)
          ?.current_period_end;
        if (!currentPeriodEnd) {
          throw new InternalServerError(
            "Subscription is missing required current_period_end data"
          );
        }

        // Handle end-of-period cancellation
        if (
          subscription.cancel_at_period_end &&
          subscription.status === "active"
        ) {
          // User cancelled but keeps access until end of paid period
          console.log(
            `User ${user.id} cancelled but retains access until ${new Date(currentPeriodEnd * 1000)}`
          );
          await userService.updateUserSubscriptionFromStripe({
            userId: user.id,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price.id || null,
            tier: "PRO",
            endDate: new Date(currentPeriodEnd * 1000),
          });
          return;
        }

        // Handle immediate cancellation - check if already cleared by deleted event
        if (subscription.status === "canceled") {
          console.log(
            `Subscription ${subscription.id} canceled - checking current user state for user ${user.id}`
          );

          // Check current subscription state to avoid duplicate database writes
          const currentSubscription = await userService.getUserSubscription(
            user.id
          );

          // Only update if user is not already in FREE state with cleared Stripe data
          if (currentSubscription.tier === "PRO") {
            console.log(
              `User ${user.id} not yet cleared - updating to FREE tier`
            );
            await userService.updateUserSubscriptionFromStripe({
              userId: user.id,
              stripeSubscriptionId: null, // Clear dead subscription
              stripePriceId: null, // Clear price they're not paying for
              tier: "FREE",
              endDate: null, // No expiration for free users
            });
          } else {
            console.log(
              `User ${user.id} already in FREE state - skipping duplicate update`
            );
          }
          return;
        }

        // Handle active subscription
        await userService.updateUserSubscriptionFromStripe({
          userId: user.id,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0]?.price.id || null,
          tier: "PRO",
          endDate: new Date(currentPeriodEnd * 1000),
        });
      } else {
        console.log(
          `Ignoring update for old subscription ${subscription.id} for user ${user.id} - current subscription is ${currentSubscription.stripe_subscription_id}`
        );
      }
    }
  );

  /**
   * Handle subscription deletion (immediate cancellation)
   */
  private handleSubscriptionDeleted = withErrorHandling(
    async (subscription: Stripe.Subscription): Promise<void> => {
      console.log("subscription deleted", JSON.stringify(subscription));
      const userService = new UserService();

      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const user = await userService.findUserByStripeCustomerId(customerId);
      if (!user) {
        throw new NotFoundError(
          `No user found for Stripe customer ID: ${customerId}`
        );
      }

      // Get current subscription state to validate this is the active subscription
      const currentSubscription = await userService.getUserSubscription(
        user.id
      );

      // Only process if this is the user's current active subscription
      if (currentSubscription.stripe_subscription_id === subscription.id) {
        console.log(
          `Cancelling current subscription ${subscription.id} for user ${user.id}`
        );

        await userService.updateUserSubscriptionFromStripe({
          userId: user.id,
          stripeSubscriptionId: null, // Clear dead subscription
          stripePriceId: null,
          tier: "FREE",
          endDate: null, // Immediate cancellation - no end date for free users
        });
      } else {
        console.log(
          `Ignoring deletion of old subscription ${subscription.id} for user ${user.id} - current subscription is ${currentSubscription.stripe_subscription_id}`
        );
      }
    }
  );

  /**
   * Handle successful invoice payment (including renewals)
   * This is crucial for updating the end_date with each billing cycle
   */
  private handleInvoicePaid = withErrorHandling(
    async (invoice: Stripe.Invoice): Promise<void> => {
      console.log("Invoice Paid", JSON.stringify(invoice));
      const userService = new UserService();

      // Only process subscription invoices - check billing_reason or subscription field
      const subscriptionId = invoice.parent?.subscription_details
        ?.subscription as string | undefined;
      const billingReason = invoice.billing_reason;

      if (
        !subscriptionId ||
        (billingReason !== "subscription_create" &&
          billingReason !== "subscription_cycle")
      ) {
        console.log(
          `Ignoring non-subscription invoice - subscriptionId: ${subscriptionId}, billingReason: ${billingReason}`
        );
        return;
      }

      const customerId = invoice.customer as string;
      const user = await userService.findUserByStripeCustomerId(customerId);
      if (!user) {
        throw new NotFoundError(
          `No user found for Stripe customer ID: ${customerId}`
        );
      }

      // Get the full subscription object to access current_period_end from items
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      // Get current_period_end from the subscription item
      const currentPeriodEnd = (subscription.items.data[0] as any)
        ?.current_period_end;
      if (!currentPeriodEnd) {
        throw new InternalServerError(
          "Subscription is missing required current_period_end data"
        );
      }

      console.log(
        `Processing successful payment for user ${user.id}, extending access until ${new Date(currentPeriodEnd * 1000)}`
      );

      // Update subscription with new end date from current billing cycle
      await userService.updateUserSubscriptionFromStripe({
        userId: user.id,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price.id || null,
        tier: "PRO",
        endDate: new Date(currentPeriodEnd * 1000),
      });
    }
  );

  /**
   * Handle failed invoice payment - immediately downgrade user
   */
  private handleInvoicePaymentFailed = withErrorHandling(
    async (invoice: Stripe.Invoice): Promise<void> => {
      console.log("Invoice Payment failed", JSON.stringify(invoice));
      const userService = new UserService();

      // Only process subscription invoices - use proper typing
      const subscriptionId = invoice.parent?.subscription_details
        ?.subscription as string | undefined;

      if (
        !subscriptionId ||
        (invoice.billing_reason !== "subscription_create" &&
          invoice.billing_reason !== "subscription_cycle")
      ) {
        console.log("Ignoring non-subscription invoice");
        return;
      }

      const customerId = invoice.customer as string;
      const user = await userService.findUserByStripeCustomerId(customerId);
      if (!user) {
        throw new NotFoundError(
          `No user found for Stripe customer ID: ${customerId}`
        );
      }

      console.log(
        `Payment failed for user ${user.id}, downgrading to FREE tier`
      );

      // Immediately downgrade user to FREE tier
      await userService.updateUserSubscriptionFromStripe({
        userId: user.id,
        stripeSubscriptionId: subscriptionId,
        stripePriceId: null,
        tier: "FREE",
        endDate: new Date(),
      });
    }
  );
}

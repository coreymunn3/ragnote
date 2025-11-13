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
   * Process Stripe webhook events to keep subscription state synchronized
   *
   * This is the main entry point for all Stripe webhook events. It routes different
   * event types to their appropriate handlers to ensure our local subscription data
   * stays in sync with Stripe's authoritative state.
   *
   * Critical events handled:
   * - subscription.created: New subscription activation after successful payment
   * - subscription.updated: Plan changes, cancellations, reactivations, status changes
   * - subscription.deleted: Immediate cancellation/deletion of subscriptions
   * - invoice.paid: Successful payments that extend access periods
   * - invoice.payment_failed: Failed payments that may require downgrading access
   *
   * @param event - The Stripe webhook event containing the event type and data payload
   * @throws {Error} If any handler encounters an error, causing webhook to return error status
   */
  public processWebhookEvent = withErrorHandling(
    async (event: Stripe.Event): Promise<void> => {
      console.log(`Processing webhook event: ${event.type}`);

      switch (event.type) {
        case "customer.subscription.created":
          // Handle new subscription creation - user just subscribed and paid
          await this.handleSubscriptionCreated(
            event.data.object as Stripe.Subscription
          );
          break;

        case "customer.subscription.updated":
          // Handle subscription changes - plan changes, cancellations, reactivations
          await this.handleSubscriptionUpdated(
            event.data.object as Stripe.Subscription
          );
          break;

        case "customer.subscription.deleted":
          // Handle immediate subscription deletion - immediate loss of access
          await this.handleSubscriptionDeleted(
            event.data.object as Stripe.Subscription
          );
          break;

        case "invoice.paid":
          // Handle successful payments - extends access for another billing cycle
          await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
          break;

        case "invoice.payment_failed":
          // Handle payment failures - may need to immediately revoke access
          await this.handleInvoicePaymentFailed(
            event.data.object as Stripe.Invoice
          );
          break;

        default:
          // Log unhandled events for monitoring - not all Stripe events are relevant
          console.log(`Unhandled event type: ${event.type}`);
      }
    }
  );

  /**
   * Handle new subscription creation - activate Pro access for user
   *
   * This webhook fires when a user successfully completes their first subscription payment
   * through Stripe Checkout. It's our signal to grant them Pro tier access in our system.
   *
   * Key responsibilities:
   * - Find the user associated with the Stripe customer
   * - Extract the subscription end date (when their access expires)
   * - Update our database to reflect their Pro status
   * - Store Stripe subscription details for future webhook processing
   *
   * Critical failure scenarios:
   * - User not found: Indicates data corruption or race condition during signup
   * - Missing subscription data: Stripe sent malformed webhook data
   *
   * @param subscription - The Stripe subscription object from the webhook
   * @throws {NotFoundError} When user cannot be found by Stripe customer ID
   * @throws {InternalServerError} When subscription is missing required billing period data
   */
  private handleSubscriptionCreated = withErrorHandling(
    async (subscription: Stripe.Subscription): Promise<void> => {
      console.log("subscription created", JSON.stringify(subscription));
      const userService = new UserService();

      // Extract customer ID - Stripe can send this as string or expanded customer object
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      // Find our user record that matches this Stripe customer
      // This is critical - we must have a user to activate
      const user = await userService.findUserByStripeCustomerId(customerId);
      if (!user) {
        // Throw error to fail webhook - this ensures Stripe retries and we don't lose the subscription
        throw new NotFoundError(
          `No user found for Stripe customer ID: ${customerId}`
        );
      }

      console.log(`Activating subscription for user ${user.id}`);

      // Extract the billing period end date from subscription items
      // This tells us when the user's paid access expires
      // Note: Stripe timestamps are in seconds, JavaScript Date expects milliseconds
      const currentPeriodEnd = (subscription.items.data[0] as any)
        ?.current_period_end;
      if (!currentPeriodEnd) {
        // Missing billing data means we can't properly track subscription lifecycle
        throw new InternalServerError(
          "Subscription is missing required current_period_end data"
        );
      }

      // Update our database to grant Pro access
      // Store all the Stripe data we need for future webhook processing
      await userService.updateUserSubscriptionFromStripe({
        userId: user.id,
        stripeSubscriptionId: subscription.id, // Track which subscription is active
        stripePriceId: subscription.items.data[0]?.price.id || null, // Track what they're paying for
        tier: "PRO", // Grant Pro tier access
        endDate: new Date(currentPeriodEnd * 1000), // When their access expires
      });
    }
  );

  /**
   * Handle subscription updates - manage plan changes, cancellations, and status changes
   *
   * This webhook fires whenever any aspect of a subscription changes in Stripe. It handles
   * multiple scenarios including plan upgrades/downgrades, cancellations, reactivations,
   * and other status changes. This is the most complex webhook handler due to the variety
   * of subscription lifecycle events it must handle.
   *
   * Key scenarios handled:
   * - Plan changes (different price IDs)
   * - End-of-period cancellations (cancel_at_period_end = true)
   * - Immediate cancellations (status = "canceled")
   * - Reactivations of previously canceled subscriptions
   * - Trial endings and conversions to paid
   *
   * Important business logic:
   * - Only processes updates for the user's current active subscription
   * - Handles "cancel at period end" gracefully (user keeps access until paid period expires)
   * - Prevents duplicate database writes for already-processed cancellations
   * - Ignores updates for old/inactive subscriptions to prevent data corruption
   *
   * @param subscription - The updated Stripe subscription object from the webhook
   * @throws {NotFoundError} When user cannot be found by Stripe customer ID
   * @throws {InternalServerError} When subscription is missing required billing period data
   */
  private handleSubscriptionUpdated = withErrorHandling(
    async (subscription: Stripe.Subscription): Promise<void> => {
      console.log("subscription updated", JSON.stringify(subscription));
      const userService = new UserService();

      // Extract customer ID - handle both string and expanded customer object
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      // Find the user associated with this subscription
      const user = await userService.findUserByStripeCustomerId(customerId);
      if (!user) {
        // Fail webhook to ensure Stripe retries - we need the user to process the update
        throw new NotFoundError(
          `No user found for Stripe customer ID: ${customerId}`
        );
      }

      // Get current subscription state to validate this update is for the active subscription
      // This prevents processing updates for old subscriptions that might still send webhooks
      const currentSubscription = await userService.getUserSubscription(
        user.id
      );

      // Only process updates for the user's current active subscription or if they have no subscription
      // This handles cases where user upgrades/downgrades and we need to track the new subscription
      if (
        currentSubscription.stripe_subscription_id === subscription.id ||
        !currentSubscription.stripe_subscription_id
      ) {
        console.log(
          `Updating subscription for user ${user.id}, status: ${subscription.status}`
        );

        // Extract billing period end date - needed for all subscription states
        const currentPeriodEnd = (subscription.items.data[0] as any)
          ?.current_period_end;
        if (!currentPeriodEnd) {
          // Can't process subscription without knowing when access expires
          throw new InternalServerError(
            "Subscription is missing required current_period_end data"
          );
        }

        // Handle "cancel at end of period" - user canceled but retains access until paid period ends
        // This is different from immediate cancellation - they keep Pro access until their billing period expires
        if (
          subscription.cancel_at_period_end &&
          subscription.status === "active"
        ) {
          console.log(
            `User ${user.id} cancelled but retains access until ${new Date(currentPeriodEnd * 1000)}`
          );
          await userService.updateUserSubscriptionFromStripe({
            userId: user.id,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price.id || null,
            tier: "PRO", // Still Pro until the end date
            endDate: new Date(currentPeriodEnd * 1000), // Access expires at end of paid period
          });
          return;
        }

        // Handle immediate cancellation - subscription was canceled and access should be revoked now
        if (subscription.status === "canceled") {
          console.log(
            `Subscription ${subscription.id} canceled - checking current user state for user ${user.id}`
          );

          // Check current state to avoid duplicate database writes
          // Sometimes both updated and deleted webhooks fire for cancellations
          const currentSubscription = await userService.getUserSubscription(
            user.id
          );

          // Only downgrade if user is still marked as Pro
          if (currentSubscription.tier === "PRO") {
            console.log(
              `User ${user.id} not yet cleared - updating to FREE tier`
            );
            await userService.updateUserSubscriptionFromStripe({
              userId: user.id,
              stripeSubscriptionId: null, // Clear the canceled subscription
              stripePriceId: null, // No longer paying for any price
              tier: "FREE", // Downgrade to free tier
              endDate: null, // Free users don't have expiration dates
            });
          } else {
            console.log(
              `User ${user.id} already in FREE state - skipping duplicate update`
            );
          }
          return;
        }

        // Handle active subscription updates (plan changes, reactivations, etc.)
        // This covers cases like plan upgrades, trial-to-paid conversions, reactivations
        await userService.updateUserSubscriptionFromStripe({
          userId: user.id,
          stripeSubscriptionId: subscription.id, // Track the active subscription
          stripePriceId: subscription.items.data[0]?.price.id || null, // Update to new price if changed
          tier: "PRO", // Maintain Pro access for active subscriptions
          endDate: new Date(currentPeriodEnd * 1000), // Update access expiry date
        });
      } else {
        // Ignore updates for old subscriptions to prevent data corruption
        // This can happen when users upgrade/downgrade and old subscriptions still send webhooks
        console.log(
          `Ignoring update for old subscription ${subscription.id} for user ${user.id} - current subscription is ${currentSubscription.stripe_subscription_id}`
        );
      }
    }
  );

  /**
   * Handle subscription deletion - immediately revoke Pro access
   *
   * This webhook fires when a subscription is permanently deleted from Stripe, either
   * through immediate cancellation, administrative deletion, or when a "cancel at period end"
   * subscription reaches its end date. This results in immediate loss of Pro access.
   *
   * Key differences from subscription.updated with "canceled" status:
   * - This is the final deletion event - subscription is completely removed from Stripe
   * - Always results in immediate access revocation (no grace period)
   * - Typically follows either an updated event or happens for immediate cancellations
   *
   * Important business logic:
   * - Only processes deletions for the user's current active subscription
   * - Ignores deletions of old/inactive subscriptions to prevent accidental downgrades
   * - Immediately downgrades user to FREE tier with no end date
   * - Clears all Stripe-related data since subscription no longer exists
   *
   * @param subscription - The deleted Stripe subscription object from the webhook
   * @throws {NotFoundError} When user cannot be found by Stripe customer ID
   */
  private handleSubscriptionDeleted = withErrorHandling(
    async (subscription: Stripe.Subscription): Promise<void> => {
      console.log("subscription deleted", JSON.stringify(subscription));
      const userService = new UserService();

      // Extract customer ID - handle both string and expanded customer object
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      // Find the user associated with this deleted subscription
      const user = await userService.findUserByStripeCustomerId(customerId);
      if (!user) {
        // Fail webhook to ensure Stripe retries - critical that we process subscription deletions
        throw new NotFoundError(
          `No user found for Stripe customer ID: ${customerId}`
        );
      }

      // Get current subscription state to validate this deletion is for the active subscription
      // This prevents accidentally downgrading users when old subscriptions get deleted
      const currentSubscription = await userService.getUserSubscription(
        user.id
      );

      // Only process deletions for the user's current active subscription
      // This protects against processing deletions of old subscriptions that might still exist in Stripe
      if (currentSubscription.stripe_subscription_id === subscription.id) {
        console.log(
          `Cancelling current subscription ${subscription.id} for user ${user.id}`
        );

        // Immediately revoke Pro access and clear all Stripe data
        // Since the subscription is deleted, we can't reference it anymore
        await userService.updateUserSubscriptionFromStripe({
          userId: user.id,
          stripeSubscriptionId: null, // Clear the deleted subscription reference
          stripePriceId: null, // No longer paying for any price
          tier: "FREE", // Immediate downgrade to free tier
          endDate: null, // Free users don't have access expiry dates
        });
      } else {
        // Ignore deletions of old subscriptions to prevent data corruption
        // This can happen when cleaning up old subscriptions in Stripe dashboard
        console.log(
          `Ignoring deletion of old subscription ${subscription.id} for user ${user.id} - current subscription is ${currentSubscription.stripe_subscription_id}`
        );
      }
    }
  );

  /**
   * Handle successful invoice payments - extend Pro access for another billing cycle
   *
   * This webhook fires when Stripe successfully collects payment for an invoice. It's critical
   * for subscription renewals because it updates the user's access expiry date to reflect
   * their newly paid billing period. Without this handler, users would lose access even
   * though they've successfully paid for another period.
   *
   * Key scenarios handled:
   * - Initial subscription payments (subscription_create)
   * - Monthly/yearly subscription renewals (subscription_cycle)
   * - Recovery from failed payment attempts (when payment finally succeeds)
   *
   * Important filtering logic:
   * - Only processes invoices related to subscriptions (ignores one-time payments)
   * - Only processes subscription creation and renewal invoices
   * - Ignores other invoice types like setup fees, credits, refunds, etc.
   *
   * Critical business impact:
   * - Updates the user's access expiry date to reflect the new billing period
   * - Ensures users don't lose access after successful payment
   * - Handles payment recoveries (user's access gets restored after failed payment is resolved)
   *
   * @param invoice - The paid Stripe invoice object from the webhook
   * @throws {NotFoundError} When user cannot be found by Stripe customer ID
   * @throws {InternalServerError} When subscription is missing required billing period data
   */
  private handleInvoicePaid = withErrorHandling(
    async (invoice: Stripe.Invoice): Promise<void> => {
      console.log("Invoice Paid", JSON.stringify(invoice));
      const userService = new UserService();

      // Extract subscription ID from the invoice - not all invoices are subscription-related
      const subscriptionId = invoice.parent?.subscription_details
        ?.subscription as string | undefined;
      const billingReason = invoice.billing_reason;

      // Only process subscription-related invoices
      // subscription_create: Initial subscription payment
      // subscription_cycle: Regular recurring billing cycle payment
      if (
        !subscriptionId ||
        (billingReason !== "subscription_create" &&
          billingReason !== "subscription_cycle")
      ) {
        console.log(
          `Ignoring non-subscription invoice - subscriptionId: ${subscriptionId}, billingReason: ${billingReason}`
        );
        return; // Not an error - we just don't care about non-subscription invoices
      }

      // Find the user who made this payment
      const customerId = invoice.customer as string;
      const user = await userService.findUserByStripeCustomerId(customerId);
      if (!user) {
        // Critical error - we have a payment but no user to credit it to
        throw new NotFoundError(
          `No user found for Stripe customer ID: ${customerId}`
        );
      }

      // Get the full subscription object to extract the new billing period dates
      // The invoice doesn't contain the updated billing period info, so we need to fetch the subscription
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      // Extract the new billing period end date
      // This represents when the user's newly paid access will expire
      const currentPeriodEnd = (subscription.items.data[0] as any)
        ?.current_period_end;
      if (!currentPeriodEnd) {
        // Can't extend access without knowing when it expires
        throw new InternalServerError(
          "Subscription is missing required current_period_end data"
        );
      }

      console.log(
        `Processing successful payment for user ${user.id}, extending access until ${new Date(currentPeriodEnd * 1000)}`
      );

      // Update the user's subscription with the new access expiry date
      // This is what actually extends their Pro access for the newly paid billing period
      await userService.updateUserSubscriptionFromStripe({
        userId: user.id,
        stripeSubscriptionId: subscription.id, // Maintain subscription tracking
        stripePriceId: subscription.items.data[0]?.price.id || null, // Track current price
        tier: "PRO", // Ensure Pro access (important for payment recovery scenarios)
        endDate: new Date(currentPeriodEnd * 1000), // Extend access to end of newly paid period
      });
    }
  );

  /**
   * Handle failed invoice payments - immediately revoke Pro access due to non-payment
   *
   * This webhook fires when Stripe fails to collect payment for a subscription invoice.
   * It represents a critical business event where the user's payment method has failed
   * and they can no longer access Pro features until payment is resolved.
   *
   * Key scenarios handled:
   * - Initial subscription payment failures (subscription_create)
   * - Recurring billing failures (subscription_cycle)
   * - Credit card expiration, insufficient funds, declined cards
   * - Bank account failures for direct debit payments
   *
   * Important business decisions:
   * - Immediately revokes Pro access (no grace period)
   * - Sets end date to current time to indicate immediate access loss
   * - Clears price ID since user is no longer paying for any tier
   * - Maintains subscription ID for potential payment recovery tracking
   *
   * Payment recovery handling:
   * - If user later provides valid payment method and Stripe retries successfully,
   *   the invoice.paid webhook will restore their Pro access
   * - This creates a seamless experience for temporary payment issues
   *
   * @param invoice - The failed Stripe invoice object from the webhook
   * @throws {NotFoundError} When user cannot be found by Stripe customer ID
   */
  private handleInvoicePaymentFailed = withErrorHandling(
    async (invoice: Stripe.Invoice): Promise<void> => {
      console.log("Invoice Payment failed", JSON.stringify(invoice));
      const userService = new UserService();

      // Extract subscription ID - only process subscription-related payment failures
      const subscriptionId = invoice.parent?.subscription_details
        ?.subscription as string | undefined;

      // Only process subscription payment failures
      // subscription_create: Initial payment for new subscription failed
      // subscription_cycle: Recurring payment for existing subscription failed
      if (
        !subscriptionId ||
        (invoice.billing_reason !== "subscription_create" &&
          invoice.billing_reason !== "subscription_cycle")
      ) {
        console.log("Ignoring non-subscription invoice");
        return; // Not an error - we don't care about non-subscription invoice failures
      }

      // Find the user whose payment failed
      const customerId = invoice.customer as string;
      const user = await userService.findUserByStripeCustomerId(customerId);
      if (!user) {
        // Critical error - we have a payment failure but no user to apply it to
        throw new NotFoundError(
          `No user found for Stripe customer ID: ${customerId}`
        );
      }

      console.log(
        `Payment failed for user ${user.id}, downgrading to FREE tier`
      );

      // Immediately revoke Pro access due to payment failure
      // This is a business decision to provide immediate feedback for payment issues
      await userService.updateUserSubscriptionFromStripe({
        userId: user.id,
        stripeSubscriptionId: subscriptionId, // Keep subscription reference for recovery
        stripePriceId: null, // Clear price since they're not successfully paying for it
        tier: "FREE", // Immediate downgrade due to payment failure
        endDate: new Date(), // Set end date to now (immediate access loss)
      });
    }
  );
}

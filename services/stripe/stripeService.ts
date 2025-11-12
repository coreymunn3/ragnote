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
}

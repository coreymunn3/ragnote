import { withErrorHandling } from "@/lib/errors/errorHandlers";
import {
  getUserSubscriptionSchema,
  createStripeCustomerSchema,
  updateSubscriptionFromStripeSchema,
  hasProAccessSchema,
  upgradeToProTrialSchema,
} from "./userValidators";
import { prisma } from "@/lib/prisma";
import {
  UserSubscription,
  CreateStripeCustomerParams,
  UpdateSubscriptionFromStripeParams,
  HasProAccessParams,
  UpgradeToProTrialParams,
} from "@/lib/types/userTypes";
import { transformUserSubscription } from "./userTransformers";
import { NotFoundError } from "@/lib/errors/apiErrors";
import stripe from "@/lib/stripe/stripe-admin";

export class UserService {
  /**
   * Get a user's subscription status
   */
  public getUserSubscription = withErrorHandling(
    async (userId: string): Promise<UserSubscription> => {
      const { userId: validatedUserId } = getUserSubscriptionSchema.parse({
        userId,
      });

      // First verify that the user exists
      const user = await prisma.app_user.findUnique({
        where: {
          id: validatedUserId,
        },
      });

      if (!user) {
        throw new NotFoundError(`User with ID ${validatedUserId} not found`);
      }

      // Now get the subscription - it should always exist since it's created with the user
      const subscription = await prisma.user_subscription.findUnique({
        where: {
          user_id: validatedUserId,
        },
      });

      // If no subscription is found, this indicates a data integrity issue
      if (!subscription) {
        throw new NotFoundError(
          `Subscription not found for user ${validatedUserId}. This indicates a data integrity issue.`
        );
      }

      // Transform and return the subscription
      return transformUserSubscription(subscription);
    }
  );

  /**
   * Create a Stripe customer for a user and store the customer ID
   */
  public createStripeCustomer = withErrorHandling(
    async (params: CreateStripeCustomerParams): Promise<string> => {
      const { userId, email, name } = createStripeCustomerSchema.parse(params);

      // Check if user already has a Stripe customer ID
      const existingUser = await prisma.app_user.findUnique({
        where: { id: userId },
        select: { stripe_customer_id: true, email: true },
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
        name,
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
   * Check if user has Pro access (considering end_date fallback)
   */
  public hasProAccess = withErrorHandling(
    async (params: HasProAccessParams): Promise<boolean> => {
      const { userId } = hasProAccessSchema.parse(params);

      const subscription = await prisma.user_subscription.findUnique({
        where: { user_id: userId },
        select: { tier: true, end_date: true },
      });

      if (!subscription) {
        return false;
      }

      // Pro access logic: tier is PRO AND (end_date is null OR end_date is in future)
      return (
        subscription.tier === "PRO" &&
        (subscription.end_date === null || subscription.end_date > new Date())
      );
    }
  );

  /**
   * Update subscription from Stripe webhook data
   */
  public updateSubscriptionFromStripe = withErrorHandling(
    async (
      params: UpdateSubscriptionFromStripeParams
    ): Promise<UserSubscription> => {
      const {
        userId,
        stripeSubscriptionId,
        stripePriceId,
        tier,
        status,
        endDate,
      } = updateSubscriptionFromStripeSchema.parse(params);

      // Update the subscription record
      const updatedSubscription = await prisma.user_subscription.update({
        where: { user_id: userId },
        data: {
          stripe_subscription_id: stripeSubscriptionId,
          stripe_price_id: stripePriceId,
          tier,
          status,
          end_date: endDate,
        },
      });

      return transformUserSubscription(updatedSubscription);
    }
  );

  /**
   * Upgrade user to Pro trial (manual operation, not Stripe-based)
   */
  public upgradeToProTrial = withErrorHandling(
    async (params: UpgradeToProTrialParams): Promise<UserSubscription> => {
      const { userId, trialDays = 10 } = upgradeToProTrialSchema.parse(params);

      // Calculate trial end date
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + trialDays);

      // Update subscription to Pro trial
      const updatedSubscription = await prisma.user_subscription.update({
        where: { user_id: userId },
        data: {
          tier: "PRO",
          status: "TRIAL",
          end_date: trialEndDate,
          // Clear Stripe fields for trials
          stripe_subscription_id: null,
          stripe_price_id: null,
        },
      });

      return transformUserSubscription(updatedSubscription);
    }
  );
}

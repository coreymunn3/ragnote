import { withErrorHandling } from "@/lib/errors/errorHandlers";
import {
  getUserSubscriptionSchema,
  hasProAccessSchema,
  updateUserSubscriptionFromStripeSchema,
  upgradeToProTrialSchema,
} from "./userValidators";
import { prisma } from "@/lib/prisma";
import {
  UserSubscription,
  HasProAccessParams,
  UpgradeToProTrialParams,
  UpdateUserSubscriptionFromStripeParams,
} from "@/lib/types/userTypes";
import { transformUserSubscription } from "./userTransformers";
import { NotFoundError } from "@/lib/errors/apiErrors";

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
   * Update user's subscription data from Stripe webhook events
   */
  public updateUserSubscriptionFromStripe = withErrorHandling(
    async (
      params: UpdateUserSubscriptionFromStripeParams
    ): Promise<UserSubscription> => {
      const { userId, stripeSubscriptionId, stripePriceId, tier, endDate } =
        updateUserSubscriptionFromStripeSchema.parse(params);

      // Update the subscription record
      const updatedSubscription = await prisma.user_subscription.update({
        where: { user_id: userId },
        data: {
          stripe_subscription_id: stripeSubscriptionId,
          stripe_price_id: stripePriceId,
          tier,
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
          end_date: trialEndDate,
          // Clear Stripe fields for trials
          stripe_subscription_id: null,
          stripe_price_id: null,
        },
      });

      return transformUserSubscription(updatedSubscription);
    }
  );

  /**
   * Find user by Stripe customer ID (for webhook processing)
   */
  public findUserByStripeCustomerId = withErrorHandling(
    async (
      stripeCustomerId: string
    ): Promise<{ id: string; email: string } | null> => {
      const user = await prisma.app_user.findUnique({
        where: { stripe_customer_id: stripeCustomerId },
        select: { id: true, email: true },
      });

      if (!user) {
        console.error(
          `User not found for Stripe customer ID: ${stripeCustomerId}`
        );
        return null;
      }

      return user;
    }
  );
}

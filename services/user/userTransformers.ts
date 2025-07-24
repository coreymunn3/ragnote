import {
  PrismaUserSubscription,
  UserSubscription,
} from "@/lib/types/userTypes";

/**
 * Returns only necessary data for the user subscription to be used in the frontend
 * @param subscription Prisma User Subscription object
 * @returns
 */
export const transformUserSubscription = (
  subscription: PrismaUserSubscription
): UserSubscription => {
  return {
    id: subscription.id,
    tier: subscription.tier,
    status: subscription.status,
    start_date: subscription.start_date,
    end_date: subscription.end_date,
  };
};

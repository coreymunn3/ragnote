import { Expand } from "./sharedTypes";

/**
 * Simplified & Safe types for frontend/backend
 */
export type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "PAUSED" | "TRIAL";

export type UserSubscription = {
  id: string;
  tier: "FREE" | "PRO";
  status: SubscriptionStatus;
  end_date: Date | null;
};

/**
 * Prisma Types - full schema-identical prisma objects
 */
export type PrismaUserSubscription = {
  id: string;
  user_id: string;
  tier: "FREE" | "PRO";
  status: "ACTIVE" | "CANCELLED" | "PAUSED" | "TRIAL";
  end_date: Date | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  created_at: Date;
  updated_at: Date;
};

/**
 * Parameter types for UserService methods
 */
export type CreateStripeCustomerParams = {
  userId: string;
  email: string;
  name?: string;
};

export type UpdateSubscriptionFromStripeParams = {
  userId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  tier: "FREE" | "PRO";
  status: SubscriptionStatus;
  endDate?: Date | null;
};

export type HasProAccessParams = {
  userId: string;
};

export type UpgradeToProTrialParams = {
  userId: string;
  trialDays?: number;
};

import { Expand } from "./sharedTypes";

/**
 * Simplified & Safe types for frontend/backend
 */
export type UserSubscription = {
  id: string;
  tier: "FREE" | "PRO";
  end_date: Date | null;
  stripe_price_id: string | null;
  stripe_subscription_id: string | null;
};

export type CreateCheckoutSessionRequest = {
  return_url: string;
};

export type CreateCheckoutSessionResponse = {
  url: string;
};

/**
 * Prisma Types - full schema-identical prisma objects
 */
export type PrismaUserSubscription = {
  id: string;
  user_id: string;
  tier: "FREE" | "PRO";
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
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  tier: "FREE" | "PRO";
  endDate?: Date | null;
};

export type HasProAccessParams = {
  userId: string;
};

export type UpgradeToProTrialParams = {
  userId: string;
  trialDays?: number;
};

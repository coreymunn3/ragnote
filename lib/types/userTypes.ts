import { Expand } from "./sharedTypes";

/**
 * Simplified & Safe types for frontend
 */
export type UserSubscription = {
  id: string;
  tier: "FREE" | "PRO";
  status: "ACTIVE" | "CANCELLED" | "PAUSED" | "TRIAL";
  start_date: Date;
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
  start_date: Date;
  end_date: Date | null;
  renewal_date: Date | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  created_at: Date;
  updated_at: Date;
};

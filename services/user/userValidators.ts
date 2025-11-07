import { z } from "zod";

export const getUserSubscriptionSchema = z.object({
  userId: z.string().uuid(),
});

export const createStripeCustomerSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
});

export const updateSubscriptionFromStripeSchema = z.object({
  userId: z.string().uuid(),
  stripeSubscriptionId: z.string(),
  stripePriceId: z.string(),
  tier: z.enum(["FREE", "PRO"]),
  endDate: z.date().nullable().optional(),
});

export const hasProAccessSchema = z.object({
  userId: z.string().uuid(),
});

export const upgradeToProTrialSchema = z.object({
  userId: z.string().uuid(),
  trialDays: z.number().int().min(1).max(365).optional().default(10),
});

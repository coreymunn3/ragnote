import { z } from "zod";

export const createStripeCustomerSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
});

export const createBillingPortalSessionSchema = z.object({
  stripeCustomerId: z.string(),
  returnUrl: z.string(),
});

export const createCheckoutSessionSchema = z.object({
  stripeCustomerId: z.string(),
  userId: z.string().uuid(),
  returnUrl: z.string(),
});

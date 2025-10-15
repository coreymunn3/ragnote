import { Stripe, loadStripe } from "@stripe/stripe-js";

/**
 * This file sets up the client side stripe js package, used only in client components
 */
let stripePromise: Promise<Stripe | null>;

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set");
}

// singleton pattern
// from https://vercel.com/guides/getting-started-with-nextjs-typescript-stripe
const getStripeClient = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

export default getStripeClient;

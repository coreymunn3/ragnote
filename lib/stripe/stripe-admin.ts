import Stripe from "stripe";

/**
 * This file sets up the stripe "admin" or backend stripe functionality using the stripe secret key
 */
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY not set");
}

const stripe = new Stripe(stripeSecretKey!);

export default stripe;

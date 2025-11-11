import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/services/user/userService";
import { getDbUser } from "@/lib/getDbUser";
import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";
import stripe from "@/lib/stripe/stripe-admin";
import { CreateCheckoutSessionRequest } from "@/lib/types/userTypes";
import { BadRequestError } from "@/lib/errors/apiErrors";

const userService = new UserService();

/**
 * POST /api/stripe/checkout
 * Create a Stripe checkout session for Pro subscription upgrade
 */
const postHandler = async (req: NextRequest) => {
  auth.protect();
  const dbUser = await getDbUser();
  const body: CreateCheckoutSessionRequest = await req.json();

  if (!body.return_url) {
    throw new BadRequestError("return_url is required");
  }

  // Create or get existing Stripe customer
  const stripeCustomerId = await userService.getOrCreateStripeCustomer({
    userId: dbUser.id,
    email: dbUser.email,
  });

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ["card", "link"],
    mode: "subscription",
    line_items: [
      {
        price: process.env.STRIPE_PRO_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${body.return_url}?upgrade=success`,
    cancel_url: `${body.return_url}/dashboard?upgrade=canceled`,
    metadata: {
      user_id: dbUser.id,
      tier: "PRO",
    },
  });

  return NextResponse.json({ url: session.url }, { status: 200 });
};

export const POST = withApiErrorHandling(
  postHandler,
  "POST /api/stripe/checkout"
);

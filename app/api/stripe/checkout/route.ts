import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/getDbUser";
import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";
import { BadRequestError } from "@/lib/errors/apiErrors";
import { StripeService } from "@/services/stripe/stripeService";
import { CreateCheckoutSessionRequest } from "@/lib/types/stripeTypes";

const stripeService = new StripeService();

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
  const stripeCustomerId = await stripeService.getOrCreateStripeCustomer({
    userId: dbUser.id,
    email: dbUser.email,
  });

  // Create checkout session
  const session = await stripeService.createCheckoutSession({
    stripeCustomerId,
    userId: dbUser.id,
    returnUrl: body.return_url,
  });

  return NextResponse.json({ url: session.url }, { status: 200 });
};

export const POST = withApiErrorHandling(
  postHandler,
  "POST /api/stripe/checkout"
);

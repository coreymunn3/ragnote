import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/getDbUser";
import { UserService } from "@/services/user/userService";
import stripe from "@/lib/stripe/stripe-admin";
import { BadRequestError, InternalServerError } from "@/lib/errors/apiErrors";
import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";

const userService = new UserService();

const postHandler = async (req: NextRequest) => {
  // Get the database user using your established pattern
  const dbUser = await getDbUser();

  // Get return URL from request body
  const body = await req.json();
  const { return_url } = body;

  if (!return_url) {
    throw new BadRequestError("return_url is required");
  }

  if (!process.env.STRIPE_BILLING_PORTAL_CONFIGURATION) {
    throw new InternalServerError(
      "STRIPE_BILLING_PORTAL_CONFIGURATION is not set"
    );
  }

  // Get or create Stripe customer using the database user ID
  const stripeCustomerId = await userService.getOrCreateStripeCustomer({
    userId: dbUser.id,
    email: dbUser.email,
  });

  // Create billing portal session
  const portalSession = await stripe.billingPortal.sessions.create({
    configuration: process.env.STRIPE_BILLING_PORTAL_CONFIGURATION,
    customer: stripeCustomerId,
    return_url: return_url,
  });

  return NextResponse.json(
    {
      url: portalSession.url,
    },
    { status: 200 }
  );
};

export const POST = withApiErrorHandling(
  postHandler,
  "POST /api/stripe/billingportal"
);

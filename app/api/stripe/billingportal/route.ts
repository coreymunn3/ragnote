import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/getDbUser";
import { BadRequestError } from "@/lib/errors/apiErrors";
import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";
import { StripeService } from "@/services/stripe/stripeService";
import { CreateBillingPortalSessionRequest } from "@/lib/types/stripeTypes";

const stripeService = new StripeService();

const postHandler = async (req: NextRequest) => {
  // Get the database user using your established pattern
  const dbUser = await getDbUser();

  // Get return URL from request body
  const body: CreateBillingPortalSessionRequest = await req.json();
  const { return_url } = body;

  if (!return_url) {
    throw new BadRequestError("return_url is required");
  }

  // Get or create Stripe customer using the database user ID
  const stripeCustomerId = await stripeService.getOrCreateStripeCustomer({
    userId: dbUser.id,
    email: dbUser.email,
  });

  // Create billing portal session
  const session = await stripeService.createBillingPortalSession({
    stripeCustomerId,
    returnUrl: return_url,
  });

  return NextResponse.json(
    {
      url: session.url,
    },
    { status: 200 }
  );
};

export const POST = withApiErrorHandling(
  postHandler,
  "POST /api/stripe/billingportal"
);

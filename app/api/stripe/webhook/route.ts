import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import stripe from "@/lib/stripe/stripe-admin";
import { StripeService } from "@/services/stripe/stripeService";
import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";
import { saveWebhookEvent } from "@/lib/utils/webhook-events";

const stripeService = new StripeService();

const postHandler = async (req: NextRequest) => {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return new NextResponse("Webhook secret not configured", { status: 500 });
  }

  if (!signature) {
    console.error("Missing stripe-signature header");
    return new NextResponse("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new NextResponse(
      `Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      { status: 400 }
    );
  }

  console.log(`Processing webhook event: ${event.type}`);

  // Check for duplicate webhook using deduplication
  const isNewEvent = await saveWebhookEvent({
    provider: "STRIPE",
    webhookId: event.id,
    eventType: event.type,
    eventPayload: event.data,
  });

  if (!isNewEvent) {
    console.log(`Duplicate Stripe webhook ${event.id} - skipping processing`);
    return new NextResponse("Duplicate webhook ignored", { status: 200 });
  }

  await stripeService.processWebhookEvent(event);
  return new NextResponse("Webhook processed successfully", { status: 200 });
};

export const POST = withApiErrorHandling(postHandler, "/api/stripe/webhook");

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { UserService } from "@/services/user/userService";
import { prisma } from "@/lib/prisma";
import stripe from "@/lib/stripe/stripe-admin";

const userService = new UserService();

export async function POST(req: NextRequest) {
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

  try {
    switch (event.type) {
      case "customer.subscription.created":
        await handleSubscriptionCreated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new NextResponse("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error(`Error processing webhook ${event.type}:`, error);
    return new NextResponse("Webhook processing failed", { status: 500 });
  }
}

/**
 * Handle new subscription creation
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log("subscription", JSON.stringify(subscription));
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const user = await userService.findUserByStripeCustomerId(customerId);
  if (!user) return;

  console.log(`Activating subscription for user ${user.id}`);

  // Get current_period_end from the subscription item (Stripe timestamps are in seconds, JS Date expects milliseconds)
  const currentPeriodEnd = (subscription.items.data[0] as any)
    ?.current_period_end;
  if (!currentPeriodEnd) {
    console.error("Missing current_period_end in subscription item");
    return;
  }

  await userService.updateSubscriptionFromStripe({
    userId: user.id,
    stripeSubscriptionId: subscription.id,
    stripePriceId: subscription.items.data[0]?.price.id || null,
    tier: "PRO",
    endDate: new Date(currentPeriodEnd * 1000),
  });
}

/**
 * Handle subscription updates (plan changes, reactivations, etc.)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log("subscription", JSON.stringify(subscription));
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const user = await userService.findUserByStripeCustomerId(customerId);
  if (!user) return;

  console.log(
    `Updating subscription for user ${user.id}, status: ${subscription.status}`
  );

  // Get current_period_end from the subscription item
  const currentPeriodEnd = (subscription.items.data[0] as any)
    ?.current_period_end;
  if (!currentPeriodEnd) {
    console.error("Missing current_period_end in subscription item");
    return;
  }

  // Handle end-of-period vs immediate cancellation
  if (subscription.cancel_at_period_end && subscription.status === "active") {
    // User cancelled but keeps access until end of paid period
    console.log(
      `User ${user.id} cancelled but retains access until ${new Date(currentPeriodEnd * 1000)}`
    );
    await userService.updateSubscriptionFromStripe({
      userId: user.id,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price.id || null,
      tier: "PRO", // Keep PRO until end date
      endDate: new Date(currentPeriodEnd * 1000),
    });
    return;
  }

  // Determine tier based on subscription status
  const tier = subscription.status === "canceled" ? "FREE" : "PRO";

  // Set end date - null for active recurring, actual date for canceled
  const endDate = subscription.cancel_at
    ? new Date(subscription.cancel_at * 1000)
    : subscription.status === "canceled"
      ? new Date()
      : new Date(currentPeriodEnd * 1000);

  await userService.updateSubscriptionFromStripe({
    userId: user.id,
    stripeSubscriptionId: subscription.id,
    stripePriceId: subscription.items.data[0]?.price.id || null,
    tier,
    endDate,
  });
}

/**
 * Handle subscription deletion (immediate cancellation)
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log("subscription", JSON.stringify(subscription));
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const user = await userService.findUserByStripeCustomerId(customerId);
  if (!user) return;

  console.log(`Cancelling subscription for user ${user.id}`);

  await userService.updateSubscriptionFromStripe({
    userId: user.id,
    stripeSubscriptionId: subscription.id,
    stripePriceId: null,
    tier: "FREE",
    endDate: new Date(), // Immediate cancellation
  });
}

/**
 * Handle successful invoice payment (including renewals)
 * This is crucial for updating the end_date with each billing cycle
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // Only process subscription invoices - check billing_reason or subscription field
  const subscriptionId = invoice.parent?.subscription_details?.subscription as
    | string
    | undefined;
  const billingReason = invoice.billing_reason;

  console.log(
    `Invoice debug - subscriptionId: ${subscriptionId}, billingReason: ${billingReason}`
  );

  if (
    !subscriptionId ||
    (billingReason !== "subscription_create" &&
      billingReason !== "subscription_cycle")
  ) {
    console.log(
      `Ignoring non-subscription invoice - subscriptionId: ${subscriptionId}, billingReason: ${billingReason}`
    );
    return;
  }

  const customerId = invoice.customer as string;
  const user = await userService.findUserByStripeCustomerId(customerId);
  if (!user) return;

  // Get the full subscription object to access current_period_end from items
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Get current_period_end from the subscription item
  const currentPeriodEnd = (subscription.items.data[0] as any)
    ?.current_period_end;
  if (!currentPeriodEnd) {
    console.log("Subscription missing current_period_end in items");
    return;
  }

  console.log(
    `Processing successful payment for user ${user.id}, extending access until ${new Date(currentPeriodEnd * 1000)}`
  );

  // Update subscription with new end date from current billing cycle
  await userService.updateSubscriptionFromStripe({
    userId: user.id,
    stripeSubscriptionId: subscription.id,
    stripePriceId: subscription.items.data[0]?.price.id || null,
    tier: "PRO",
    endDate: new Date(currentPeriodEnd * 1000),
  });
}

/**
 * Handle failed invoice payment - immediately downgrade user
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Only process subscription invoices - use proper typing
  const subscriptionId = invoice.parent?.subscription_details?.subscription as
    | string
    | undefined;

  if (
    !subscriptionId ||
    (invoice.billing_reason !== "subscription_create" &&
      invoice.billing_reason !== "subscription_cycle")
  ) {
    console.log("Ignoring non-subscription invoice");
    return;
  }

  const customerId = invoice.customer as string;
  const user = await userService.findUserByStripeCustomerId(customerId);
  if (!user) return;

  console.log(`Payment failed for user ${user.id}, downgrading to FREE tier`);

  // Immediately downgrade user to FREE tier
  await userService.updateSubscriptionFromStripe({
    userId: user.id,
    stripeSubscriptionId: subscriptionId,
    stripePriceId: null,
    tier: "FREE",
    endDate: new Date(),
  });
}

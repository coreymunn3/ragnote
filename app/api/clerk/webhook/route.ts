import { Webhook } from "svix";
import { headers } from "next/headers";
import { ClerkWebhookEvent } from "@/lib/types/clerkTypes";
import { NextResponse } from "next/server";
import { ClerkService } from "@/services/clerk/clerkService";
import { transformClerkUserData } from "@/services/clerk/clerkTransformers";
import { saveWebhookEvent } from "@/lib/utils/webhook-events";

export async function POST(req: Request) {
  const CLERK_WEBHOOK_SIGNING_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

  if (!CLERK_WEBHOOK_SIGNING_SECRET) {
    throw new Error(
      "Error: Please add CLERK_WEBHOOK_SIGNING_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(CLERK_WEBHOOK_SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Error: Missing Svix headers");
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: ClerkWebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  const eventType = evt.type;
  const { id } = evt.data;
  console.log(`Received webhook with ID ${id} and event type of ${eventType}`);

  // Check for duplicate webhook using deduplication
  try {
    const isNewEvent = await saveWebhookEvent({
      provider: "CLERK",
      webhookId: svix_id,
      eventType: evt.type,
      eventPayload: evt.data,
    });

    if (!isNewEvent) {
      console.log(`Duplicate Clerk webhook ${svix_id} - skipping processing`);
      return new Response("Duplicate webhook ignored", { status: 200 });
    }
  } catch (error) {
    console.error("Failed to save webhook event:", error);
    return new NextResponse(`Failed to process webhook: ${error}`, {
      status: 500,
    });
  }

  const clerkService = new ClerkService();

  try {
    switch (evt.type) {
      case "user.created":
        // Validate we have the required user data
        if (!id) {
          console.error("Incomplete Webhook Payload: missing id");
          return new Response("Incomplete Webhook Payload: missing id", {
            status: 400,
          });
        }

        const createUserData = transformClerkUserData(evt.data);
        if (!createUserData.email) {
          console.error("Incomplete Webhook Payload: missing email_address");
          return new Response(
            "Incomplete Webhook Payload: missing email_address",
            { status: 400 }
          );
        }

        await clerkService.createUserFromClerk(createUserData);
        break;

      case "user.updated":
        // Validate we have the required user data
        if (!id) {
          console.error("Incomplete Webhook Payload: missing id");
          return new Response("Incomplete Webhook Payload: missing id", {
            status: 400,
          });
        }

        const updateUserData = transformClerkUserData(evt.data);
        if (!updateUserData.email) {
          console.error("Incomplete Webhook Payload: missing email_address");
          return new Response(
            "Incomplete Webhook Payload: missing email_address",
            { status: 400 }
          );
        }

        await clerkService.updateUserFromClerk(updateUserData);
        break;

      case "user.deleted":
        // For delete events, we only need the id
        if (!id) {
          console.error("Incomplete Webhook Payload: missing id");
          return new Response("Incomplete Webhook Payload: missing id", {
            status: 400,
          });
        }

        await clerkService.softDeleteUserFromClerk({ clerkId: id });
        break;

      default:
        console.log(`Unhandled Event Type from Clerk webhook: ${evt.type}`);
    }
  } catch (error) {
    console.error(`Clerk webhook error for ${evt.type}:`, error);
    return new NextResponse(`Webhook processing failed: ${error}`, {
      status: 500,
    });
  }

  return new Response("Webhook received", { status: 200 });
}

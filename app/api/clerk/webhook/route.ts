import { Webhook } from "svix";
import { headers } from "next/headers";
import { ClerkWebhookEvent } from "@/lib/types/clerkTypes";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { NEW_ACCOUNT_SIGNUP_BONUS } from "@/CONSTANTS";

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

  // Do something with payload
  // For this guide, log payload to console
  const eventType = evt.type;
  const { id } = evt.data; // Extract only the id which is common to all event types
  console.log(`Received webhook with ID ${id} and event type of ${eventType}`);
  console.log("Webhook payload:", body);

  // Define fullData and email_address variables that will be used in non-delete events
  let email_address: string | undefined;
  let fullData: {
    username?: string | null;
    email_addresses?: { email_address: string }[];
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
    [key: string]: any;
  } = {};

  // For delete events, we only need the id
  if (eventType === "user.deleted") {
    if (!id) {
      console.error("Incomplete Webhook Payload: missing id");
      return new Response("Incomplete Webhook Payload: missing id", {
        status: 400,
      });
    }
  } else {
    // For other events, we need to check if we have the full user data
    fullData = evt.data as typeof fullData;
    email_address = fullData.email_addresses?.[0]?.email_address;

    if (!id || !email_address) {
      console.error("Incomplete Webhook Payload: missing id or email_address");
      return new Response(
        "Incomplete Webhook Payload: missing id or email_address",
        {
          status: 400,
        }
      );
    }
  }

  switch (evt.type) {
    /**
     * Create the user in the database and award them 100 bonus credits to explore AI functions
     */

    case "user.created":
      let newUser;
      // 1. create the user
      try {
        newUser = await prisma.app_user.create({
          data: {
            clerk_id: id,
            username: fullData.username || null,
            email: email_address!,
            first_name: fullData.first_name || null,
            last_name: fullData.last_name || null,
            avatar_url: fullData.image_url || null,
          },
        });
      } catch (error) {
        console.error(error);
        return new NextResponse(
          `Unable to ${evt.type} user ${email_address}: ${error}`,
          {
            status: 500,
          }
        );
      }
      // 2. Create the user subscription
      try {
        await prisma.user_subscription.create({
          data: {
            user_id: newUser.id,
            tier: "FREE",
          },
        });
      } catch (error) {
        console.error(error);
        return new NextResponse(
          `Unable to ${evt.type} user ${email_address} (failed to create subscription): ${error}`,
          { status: 500 }
        );
      }
      // 2. now we will need the database ID to award the bonus credits
      try {
        if (!newUser) {
          return new NextResponse(
            `Unable to find newly created user with clerkId ${id}`,
            {
              status: 500,
            }
          );
        }
        // 3. award the user bonus credits via a credit_transaction
        await prisma.credit_transaction.create({
          data: {
            user_id: newUser.id,
            amount: NEW_ACCOUNT_SIGNUP_BONUS,
            transaction_type: "BONUS",
            description: "New Account Bonus",
          },
        });
      } catch (error) {
        console.error(error);
      }
      break;
    case "user.updated":
      try {
        await prisma.app_user.upsert({
          where: { clerk_id: id },
          update: {
            username: fullData.username || null,
            email: email_address!,
            clerk_id: id,
            first_name: fullData.first_name || null,
            last_name: fullData.last_name || null,
            avatar_url: fullData.image_url || null,
          },
          create: {
            username: fullData.username || null,
            email: email_address!,
            clerk_id: id,
            first_name: fullData.first_name || null,
            last_name: fullData.last_name || null,
            avatar_url: fullData.image_url || null,
          },
        });
      } catch (error) {
        console.error(error);
        return new NextResponse(
          `Unable to ${evt.type} user ${email_address}: ${error}`,
          {
            status: 500,
          }
        );
      }
      break;
    case "user.deleted":
      try {
        /**
         * 1. Find the user by clerk_id
         */
        const user = await prisma.app_user.findUnique({
          where: { clerk_id: id },
          select: { id: true },
        });

        if (!user) {
          console.error(`User with clerk_id ${id} not found`);
          return new NextResponse(`User with clerk_id ${id} not found`, {
            status: 404,
          });
        }

        /**
         *  2. Delete user content while preserving the user record
         */
        // Delete folders (cascades to notes, versions, chunks, files)
        await prisma.folder.deleteMany({
          where: { user_id: user.id },
        });

        // Delete notes not in folders
        await prisma.note.deleteMany({
          where: {
            user_id: user.id,
            folder_id: null,
          },
        });

        // Delete chat sessions (cascades to messages)
        await prisma.chat_session.deleteMany({
          where: { user_id: user.id },
        });

        // Delete permissions
        await prisma.note_permission.deleteMany({
          where: {
            OR: [
              { shared_by_user_id: user.id },
              { shared_with_user_id: user.id },
            ],
          },
        });

        // Delete any files not in folders (file_content_chunks will cascade)
        await prisma.file.deleteMany({
          where: {
            user_id: user.id,
            folder_id: null,
          },
        });

        /**
         * 3. Update subscription status to cancelled
         */
        await prisma.user_subscription.updateMany({
          where: { user_id: user.id },
          data: {
            end_date: new Date(),
          },
        });

        /**
         *  4. Mark the user as deleted
         */
        await prisma.app_user.update({
          where: { id: user.id },
          data: {
            is_deleted: true,
          },
        });

        console.log(
          `User ${id} marked as deleted, subscription cancelled, and content removed`
        );
      } catch (error) {
        console.error(error);
        return new NextResponse(`Unable to process ${evt.type}: ${error}`, {
          status: 500,
        });
      }
      break;
    default:
      throw new Error(`Unhandled Event Type from Clerk webhook: ${evt.type}`);
  }

  return new Response("Webhook received", { status: 200 });
}

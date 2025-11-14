"use server";

import { prisma } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { ClerkService } from "@/services/clerk/clerkService";

export async function getDbUser(safeMode = false) {
  auth.protect();
  // get the user's database ID. the clerkUserId above is not what we want to use for the user Id
  // we need user Id from the app_user table since user_id will be foreign keys in many places
  const { userId: clerkUserId } = await auth();

  let dbUser = await prisma.app_user.findFirst({
    where: {
      clerk_id: clerkUserId!,
    },
    ...(safeMode && {
      select: {
        username: true,
        avatar_url: true,
      },
    }),
  });
  /**
   * Race condition: user exists in Clerk but not in our DB yet
   * This can happen if user navigates to app before webhook processes
   * not likely to encounter this!
   */
  if (!dbUser) {
    console.log(
      `User ${clerkUserId} not found in DB - creating from Clerk data`
    );
    const cc = await clerkClient();

    try {
      // Get user data from Clerk to create the database record

      const clerkUser = await cc.users.getUser(clerkUserId!);
      const clerkService = new ClerkService();

      // Create user using the same logic as the webhook
      await clerkService.createUserFromClerk({
        clerkId: clerkUserId!,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        username: clerkUser.username,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        avatarUrl: clerkUser.imageUrl,
      });

      // Now fetch the newly created user
      dbUser = await prisma.app_user.findFirst({
        where: {
          clerk_id: clerkUserId!,
        },
        ...(safeMode && {
          select: {
            username: true,
            avatar_url: true,
          },
        }),
      });

      console.log(`Successfully created DB user for ${clerkUserId}`);
    } catch (error) {
      console.error(`Failed to create DB user for ${clerkUserId}:`, error);
      throw new Error(
        `Unable to find or create database user with Clerk Id: ${clerkUserId}`
      );
    }
  }

  if (!dbUser) {
    throw new Error(
      `Unable to find a database user with this Clerk Id: ${clerkUserId}`
    );
  }

  return dbUser;
}

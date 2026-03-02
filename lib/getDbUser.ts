"use server";

import { prisma } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { unstable_cache } from "next/cache";
import { ClerkService } from "@/services/clerk/clerkService";

// Cache the database query for 60 seconds to reduce DB calls
const getCachedDbUserFromDb = unstable_cache(
  async (clerkUserId: string, safeMode: boolean) => {
    return await prisma.app_user.findFirst({
      where: {
        clerk_id: clerkUserId,
      },
      ...(safeMode && {
        select: {
          username: true,
          avatar_url: true,
        },
      }),
    });
  },
  ["db-user"],
  {
    revalidate: 60, // Cache for 60 seconds
    tags: ["user"],
  },
);

export async function getDbUser(safeMode = false) {
  // get the user's database ID. the clerkUserId above is not what we want to use for the user Id
  // we need user Id from the app_user table since user_id will be foreign keys in many places
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    throw new Error("No authenticated user found");
  }

  let dbUser = await getCachedDbUserFromDb(clerkUserId!, safeMode);

  // If not found in cache, try direct query to handle race conditions
  if (!dbUser) {
    dbUser = await prisma.app_user.findFirst({
      where: {
        clerk_id: clerkUserId,
      },
      ...(safeMode && {
        select: {
          username: true,
          avatar_url: true,
        },
      }),
    });
  }

  // If user still doesn't exist, create them JIT (Just-In-Time)
  // This handles the case where the user signed up but the webhook hasn't processed yet, or the webhook failed.
  if (!dbUser) {
    try {
      console.log(
        `User ${clerkUserId} not found in database, creating via JIT...`,
      );

      // Fetch user data from Clerk
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(clerkUserId);

      // Use the ClerkService to upsert the user
      const clerkService = new ClerkService();
      const createdUser = await clerkService.upsertUserFromClerk({
        clerkId: clerkUser.id,
        email:
          clerkUser.emailAddresses[0]?.emailAddress ||
          `${clerkUser.id}@placeholder.com`,
        username: clerkUser.username || undefined,
        firstName: clerkUser.firstName || undefined,
        lastName: clerkUser.lastName || undefined,
        avatarUrl: clerkUser.imageUrl || undefined,
      });

      console.log(`Successfully created user ${clerkUserId} via JIT creation`);

      // Return the created user (respecting safeMode)
      if (safeMode) {
        return {
          username: createdUser.username,
          avatar_url: createdUser.avatar_url,
        };
      }
      return createdUser;
    } catch (error) {
      console.error(`Failed to create user ${clerkUserId} via JIT:`, error);
      throw new Error(
        `Unable to find or create database user with Clerk Id: ${clerkUserId}`,
      );
    }
  }

  return dbUser;
}

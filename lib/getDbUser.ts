"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { unstable_cache } from "next/cache";

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
  }
);

export async function getDbUser(safeMode = false) {
  // get the user's database ID. the clerkUserId above is not what we want to use for the user Id
  // we need user Id from the app_user table since user_id will be foreign keys in many places
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    throw new Error("No authenticated user found");
  }

  const dbUser = await getCachedDbUserFromDb(clerkUserId!, safeMode);

  if (!dbUser) {
    throw new Error(
      `Unable to find a database user with this Clerk Id: ${clerkUserId}`
    );
  }

  return dbUser;
}

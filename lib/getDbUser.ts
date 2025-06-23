"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getDbUser(safeMode = false) {
  auth.protect();
  // get the user's database ID. the clerkUserId above is not what we want to use for the user Id
  // we need user Id from the app_user table since user_id will be foreign keys in many places
  const { userId: clerkUserId } = await auth();
  const dbUser = await prisma.app_user.findFirst({
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
  if (!dbUser) {
    throw new Error(
      `Unable to find a database user with this Clerk Id: ${clerkUserId}`
    );
  }
  return dbUser;
}

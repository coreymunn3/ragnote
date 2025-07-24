import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/services/user/userService";
import { getDbUser } from "@/lib/getDbUser";
import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";

const userService = new UserService();

/**
 * GET /api/user/subscription
 * Get the current user's subscription status
 */
const getHandler = async (req: NextRequest) => {
  auth.protect();
  const dbUser = await getDbUser();
  const subscription = await userService.getUserSubscription(dbUser.id);
  return NextResponse.json(subscription, { status: 200 });
};
export const GET = withApiErrorHandling(
  getHandler,
  "GET /api/user/subscription"
);

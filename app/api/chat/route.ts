import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbUser } from "@/lib/getDbUser";
import { ChatService } from "@/services/chat/chatService";
import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";

const chatService = new ChatService();

const getHandler = async (req: NextRequest) => {
  auth.protect();
  const dbUser = await getDbUser();
  const sessions = await chatService.getChatSessionsForUser({
    userId: dbUser.id,
  });
  return NextResponse.json(sessions, {
    status: 200,
  });
};

export const GET = withApiErrorHandling(getHandler, "GET /api/chat");

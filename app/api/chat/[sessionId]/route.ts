import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";
import { getDbUser } from "@/lib/getDbUser";
import { auth } from "@clerk/nextjs/server";
import { ChatService } from "@/services/chat/chatService";
import { NextRequest, NextResponse } from "next/server";

const chatService = new ChatService();

/**
 * Get the Chat Session object given a session ID
 */
const getHandler = async (
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) => {
  auth.protect();
  const { sessionId } = await params;
  const dbUser = await getDbUser();

  // get the ChatSession object
  const chatSession = await chatService.getChatSession({
    sessionId,
    userId: dbUser.id,
  });
  return NextResponse.json(chatSession, { status: 200 });
};

export const GET = withApiErrorHandling(
  getHandler,
  "GET /api/chat/[sessionId]"
);

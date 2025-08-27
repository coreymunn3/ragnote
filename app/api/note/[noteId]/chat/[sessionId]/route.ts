import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";
import { getDbUser } from "@/lib/getDbUser";
import { auth } from "@clerk/nextjs/server";
import { ChatService } from "@/services/chat/chatService";
import { NextRequest, NextResponse } from "next/server";

const chatService = new ChatService();

/**
 * Get the chat session history for a note
 */
const getHandler = async (
  req: NextRequest,
  { params }: { params: Promise<{ noteId: string; sessionId: string }> }
) => {
  auth.protect();
  const { noteId, sessionId } = await params;
  const dbUser = await getDbUser();

  // get & return the session history
  const chatMessages = await chatService.getChatMessagesForSession({
    userId: dbUser.id,
    sessionId: sessionId,
  });

  return NextResponse.json(chatMessages, { status: 200 });
};

export const GET = withApiErrorHandling(
  getHandler,
  "GET /api/note/[noteId]/chat/[sessionId]"
);

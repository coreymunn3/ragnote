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
  { params }: { params: Promise<{ noteId: string }> }
) => {
  auth.protect();
  const { noteId } = await params;
  const dbUser = await getDbUser();

  // get & return the session history
  const sessionHistory = await chatService.getChatSessionsForNote({
    userId: dbUser.id,
    noteId,
  });

  return NextResponse.json(sessionHistory, { status: 200 });
};

export const GET = withApiErrorHandling(
  getHandler,
  "GET /api/note/[noteId]/chat/history"
);

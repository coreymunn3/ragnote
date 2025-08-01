import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";
import { getDbUser } from "@/lib/getDbUser";
import { auth } from "@clerk/nextjs/server";
import { ChatService } from "@/services/chat/chatService";
import { NextRequest, NextResponse } from "next/server";
import { SendChatWithNoteApiRequest } from "@/lib/types/chatTypes";

const chatService = new ChatService();

/**
 * Send a chat message for a specific note
 */
const postHandler = async (
  req: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) => {
  auth.protect();
  const { noteId } = await params;
  const dbUser = await getDbUser();

  // Parse request body
  const body: SendChatWithNoteApiRequest = await req.json();
  const { message, sessionId } = body;

  // Send chat using the service
  const result = await chatService.sendChat({
    userId: dbUser.id,
    message: message.trim(),
    scope: "note",
    noteId,
    sessionId, // Optional - will create new session if not provided
  });

  return NextResponse.json(result, { status: 200 });
};

export const POST = withApiErrorHandling(
  postHandler,
  "POST /api/note/[noteId]/chat"
);

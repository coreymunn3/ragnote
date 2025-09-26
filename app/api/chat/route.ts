import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";
import { getDbUser } from "@/lib/getDbUser";
import { auth } from "@clerk/nextjs/server";
import { ChatService } from "@/services/chat/chatService";
import { NextRequest, NextResponse } from "next/server";

const chatService = new ChatService();

/**
 * Gets the user's recent sessions
 */
const getHandler = async (req: NextRequest) => {
  auth.protect();
  const dbUser = await getDbUser();
  const sessions = await chatService.getChatSessionsForUser({
    userId: dbUser.id,
  });
  return NextResponse.json(sessions, { status: 200 });
};
export const GET = withApiErrorHandling(getHandler, "GET /api/chat");
/**
 * Unified chat endpoint that handles all scope types (note, folder, global)
 */
const postHandler = async (req: NextRequest) => {
  auth.protect();
  const dbUser = await getDbUser();

  // Parse request body
  const body = await req.json();
  const { message, sessionId, scope, scopeId } = body;

  // Validate required fields
  if (!message || !scope) {
    return NextResponse.json(
      { error: "Message and scope are required" },
      { status: 400 }
    );
  }

  // Validate scope-specific requirements
  if ((scope === "note" || scope === "folder") && !scopeId) {
    return NextResponse.json(
      { error: `scopeId is required for ${scope} scope` },
      { status: 400 }
    );
  }

  // Send chat using the service
  const result = await chatService.sendChat({
    userId: dbUser.id,
    message: message.trim(),
    scope,
    noteId: scope === "note" ? scopeId : undefined,
    folderId: scope === "folder" ? scopeId : undefined,
    sessionId, // Optional - will create new session if not provided
  });

  return NextResponse.json(result, { status: 200 });
};

export const POST = withApiErrorHandling(postHandler, "POST /api/chat");

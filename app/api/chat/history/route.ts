import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";
import { getDbUser } from "@/lib/getDbUser";
import { auth } from "@clerk/nextjs/server";
import { ChatService } from "@/services/chat/chatService";
import { ChatSession } from "@/lib/types/chatTypes";
import { NextRequest, NextResponse } from "next/server";

const chatService = new ChatService();

/**
 * Get chat sessions filtered by scope (note, folder, or global)
 * Query params:
 * - scope: "note" | "folder" | "global"
 * - scopeId: string (required for note/folder, not needed for global)
 */
const getHandler = async (req: NextRequest) => {
  auth.protect();
  const dbUser = await getDbUser();

  // Parse query parameters
  const searchParams = req.nextUrl.searchParams;
  const scope = searchParams.get("scope");
  const scopeId = searchParams.get("scopeId");

  // Validate scope parameter
  if (!scope) {
    return NextResponse.json(
      { error: "scope query parameter is required" },
      { status: 400 }
    );
  }

  if (!["note", "folder", "global"].includes(scope)) {
    return NextResponse.json(
      { error: "scope must be one of: note, folder, global" },
      { status: 400 }
    );
  }

  // Validate scopeId for note/folder scopes
  if ((scope === "note" || scope === "folder") && !scopeId) {
    return NextResponse.json(
      { error: `scopeId is required for ${scope} scope` },
      { status: 400 }
    );
  }

  // Get sessions based on scope
  let sessions: ChatSession[];
  switch (scope) {
    case "note":
      sessions = await chatService.getChatSessionsForNote({
        userId: dbUser.id,
        noteId: scopeId!,
      });
      break;
    case "folder":
      // TO DO: implement getChatSessionsForFolder
      sessions = [];
      break;
    case "global":
      // TO DO: implement getChatSessionsForGlobal
      sessions = [];
      break;
    default:
      return NextResponse.json({ error: "Invalid scope" }, { status: 400 });
  }

  return NextResponse.json(sessions, { status: 200 });
};

export const GET = withApiErrorHandling(getHandler, "GET /api/chat/history");

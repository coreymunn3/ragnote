import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";
import { getDbUser } from "@/lib/getDbUser";
import { auth } from "@clerk/nextjs/server";
import { ChatService } from "@/services/chat/chatService";
import { NextRequest, NextResponse } from "next/server";
import { UpdateChatApiRequest } from "@/lib/types/chatTypes";

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

/**
 * Update Chat Session
 * - rename session
 * - soft delete session
 */
const putHandler = async (
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) => {
  const { sessionId } = await params;
  const dbUser = await getDbUser();
  const body: UpdateChatApiRequest = await req.json();

  switch (body.action) {
    case "delete":
      await chatService.softDeleteChatSession({
        sessionId,
        userId: dbUser.id,
      });
      return NextResponse.json(
        {
          success: true,
        },
        {
          status: 200,
        }
      );
    case "update_title":
      if (!body.title) {
        return NextResponse.json(
          {
            success: false,
            message: "title is required for this operation",
          },
          {
            status: 400,
          }
        );
      }
      const updatedTitleChat = await chatService.updateChatSessionTitle({
        sessionId,
        title: body.title,
        userId: dbUser.id,
      });
      return NextResponse.json(updatedTitleChat, { status: 200 });
    default:
      return NextResponse.json({
        success: false,
        message:
          "action must be one of: toggle_pin, delete, update_title - or was not provided",
      });
  }
};

export const PUT = withApiErrorHandling(
  putHandler,
  "POST /api/chat/[sessionId]"
);

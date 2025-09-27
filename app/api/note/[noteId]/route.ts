import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";
import { getDbUser } from "@/lib/getDbUser";
import { auth } from "@clerk/nextjs/server";
import { NoteService } from "@/services/note/noteService";
import { NextRequest, NextResponse } from "next/server";
import { UpdateNoteApiRequest } from "@/lib/types/noteTypes";

const noteService = new NoteService();

/**
 * Get a note using its ID
 */
const getHandler = async (
  req: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) => {
  auth.protect();
  const { noteId } = await params;
  const dbUser = await getDbUser();
  const note = await noteService.getNoteById({ noteId, userId: dbUser.id });
  return NextResponse.json(note, { status: 200 });
};

export const GET = withApiErrorHandling(getHandler, "GET /api/note/[noteId]");

/**
 * Update a note
 * - pin/unpin
 * - change title
 * - move to different folder
 * - delete (soft)
 */
const putHandler = async (
  req: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) => {
  auth.protect();
  const { noteId } = await params;
  const dbUser = await getDbUser();
  const body: UpdateNoteApiRequest = await req.json();
  switch (body.action) {
    case "toggle_pin":
      const updatedNote = await noteService.togglePinNote({
        noteId,
        userId: dbUser.id,
      });
      return NextResponse.json(updatedNote, { status: 200 });
    case "move":
      // ensure folderId is present in requeset
      if (!body.folderId) {
        return NextResponse.json(
          {
            success: false,
            message: "folder ID is required for this operation",
          },
          {
            status: 400,
          }
        );
      }
      const movedNote = await noteService.moveNote({
        noteId,
        folderId: body.folderId,
        userId: dbUser.id,
      });
      return NextResponse.json(movedNote, { status: 200 });
    case "delete":
      await noteService.softDeleteNote({
        noteId,
        userId: dbUser.id,
      });
      return NextResponse.json(
        {
          success: true,
        },
        { status: 200 }
      );
    case "update_title":
      // ensure title is present in request
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
      const updatedTitleNote = await noteService.updateNoteTitle({
        noteId,
        title: body.title,
        userId: dbUser.id,
      });
      return NextResponse.json(updatedTitleNote, { status: 200 });
    default:
      return NextResponse.json({
        success: false,
        message:
          "action must be one of: toggle_pin, move, delete, update_title - or was not provided",
      });
  }
};

export const PUT = withApiErrorHandling(putHandler, "PUT /api/note/[noteId]");

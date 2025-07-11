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
      const deletedNote = await noteService.deleteNote({
        noteId,
        userId: dbUser.id,
      });
      return NextResponse.json(deletedNote, { status: 200 });
    default:
      return NextResponse.json({
        success: false,
        message:
          "action must be one of: toggle_pin, move, delete - or was not provided",
      });
  }
};

export const PUT = withApiErrorHandling(putHandler, "PUT /api/note/[noteId]");

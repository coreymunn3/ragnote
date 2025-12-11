import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbUser } from "@/lib/getDbUser";
import { CreateNoteApiRequest } from "@/lib/types/noteTypes";
import { NoteService } from "@/services/note/noteService";
import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";

const noteService = new NoteService();

/**
 * Get all notes for this user
 */
const getHandler = async (req: NextRequest) => {
  auth.protect();
  const dbUser = await getDbUser();
  const notes = await noteService.getAllNotesForUser(dbUser.id);
  return NextResponse.json(notes, {
    status: 200,
  });
};
export const GET = withApiErrorHandling(getHandler, "GET /api/note");

/**
 * Create a Note
 */
const postHandler = async (req: NextRequest) => {
  auth.protect();
  const body: CreateNoteApiRequest = await req.json();
  const dbUser = await getDbUser();
  const newNote = await noteService.createNote({
    userId: dbUser.id,
    title: body.title,
    folderId: body.folderId,
  });

  return NextResponse.json(newNote, {
    status: 201,
  });
};

export const POST = withApiErrorHandling(postHandler, "POST /api/note");

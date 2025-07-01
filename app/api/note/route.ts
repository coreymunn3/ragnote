import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbUser } from "@/lib/getDbUser";
import { CreateNoteApiRequest } from "@/lib/types/noteTypes";
import { NoteService } from "@/services/note/noteService";
import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";

const noteService = new NoteService();

const postHandler = async (req: NextRequest) => {
  auth.protect();
  const body: CreateNoteApiRequest = await req.json();
  const dbUser = await getDbUser();
  const newNote = noteService.createNote({
    userId: dbUser.id,
    title: body.title,
    folderId: body.folderId,
  });

  return NextResponse.json(newNote, {
    status: 201,
  });
};

export const POST = withApiErrorHandling(postHandler, "POST /api/note");

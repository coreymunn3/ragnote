import { getDbUser } from "@/lib/getDbUser";
import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { NoteService } from "@/services/note/noteService";
import { UpdateNoteVersionContentApiRequest } from "@/lib/types/noteTypes";

const noteService = new NoteService();

// GET a note version including its rich text and plain text content
const getHandler = async (
  req: NextRequest,
  { params }: { params: Promise<{ noteId: string; versionId: string }> }
) => {};

// PUT (update) a notes version including its rich text and plain text content
const putHandler = async (
  req: NextRequest,
  { params }: { params: Promise<{ noteId: string; versionId: string }> }
) => {
  auth.protect();
  const { noteId, versionId } = await params;
  const dbUser = await getDbUser();
  const body: UpdateNoteVersionContentApiRequest = await req.json();
  // update the note
  const savedNote = await noteService.updateNoteVersionContent({
    versionId,
    userId: dbUser.id,
    richTextContent: body.richTextContent,
  });
  return NextResponse.json(savedNote, { status: 200 });
};
export const PUT = withApiErrorHandling(
  putHandler,
  "PUT /api/note/[noteId]/version/[versionId]"
);

// POST publish this note version, which creates a new draft version entirely
const postHandler = async (
  req: NextRequest,
  { params }: { params: Promise<{ noteId: string; versionId: string }> }
) => {};

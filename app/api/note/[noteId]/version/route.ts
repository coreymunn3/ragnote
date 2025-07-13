import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";
import { getDbUser } from "@/lib/getDbUser";
import { auth } from "@clerk/nextjs/server";
import { NoteService } from "@/services/note/noteService";
import { NextRequest, NextResponse } from "next/server";

const noteService = new NoteService();

/**
 * GET all versions for a note using its ID
 */
const getHandler = async (
  req: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) => {
  auth.protect();
  const { noteId } = await params;
  const dbUser = await getDbUser();
  const noteVersions = await noteService.getNoteVersions({
    noteId,
    userId: dbUser.id,
  });
  return NextResponse.json(noteVersions, { status: 200 });
};

export const GET = withApiErrorHandling(
  getHandler,
  "GET /api/note/[noteId]/versions"
);

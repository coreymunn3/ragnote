import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { NoteService } from "@/services/note/noteService";
import { getDbUser } from "@/lib/getDbUser";
import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";

const noteService = new NoteService();

/**
 * POST to publish a note version
 */
const postHandler = async (
  req: NextRequest,
  { params }: { params: Promise<{ noteId: string; versionId: string }> }
) => {
  auth.protect();
  const dbUser = await getDbUser();
  const { versionId } = await params;
  // publish the note
  const published = await noteService.publishNoteVersion({
    versionId,
    userId: dbUser.id,
  });
  return NextResponse.json(published, { status: 200 });
};
export const POST = withApiErrorHandling(
  postHandler,
  "POST /api/note/[noteId]/version/[versionId]/publish"
);

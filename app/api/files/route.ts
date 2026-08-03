import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbUser } from "@/lib/getDbUser";
import { FileService } from "@/services/file/fileService";
import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";

/**
 * GET /api/files?folderId=<id>
 * List files for the authenticated user, optionally filtered by folder.
 */
const getHandler = async (req: NextRequest) => {
  auth.protect();
  const dbUser = await getDbUser();

  const { searchParams } = new URL(req.url);
  const folderId = searchParams.get("folderId") ?? undefined;

  const fileService = new FileService(dbUser.id);
  const files = await fileService.getFiles(folderId);

  return NextResponse.json(files, { status: 200 });
};

export const GET = withApiErrorHandling(getHandler, "GET /api/files");

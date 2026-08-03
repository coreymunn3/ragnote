import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbUser } from "@/lib/getDbUser";
import { FileService } from "@/services/file/fileService";
import { MoveFileApiRequest } from "@/lib/types/fileTypes";
import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";

/**
 * GET /api/files/[fileId]
 * Get metadata for a single file.
 */
const getHandler = async (
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) => {
  auth.protect();
  const { fileId } = await params;
  const dbUser = await getDbUser();

  const fileService = new FileService(dbUser.id);
  const file = await fileService.getFile(fileId);

  return NextResponse.json(file, { status: 200 });
};

export const GET = withApiErrorHandling(getHandler, "GET /api/files/[fileId]");

/**
 * DELETE /api/files/[fileId]
 * Soft-delete a file and remove it from R2 storage.
 */
const deleteHandler = async (
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) => {
  auth.protect();
  const { fileId } = await params;
  const dbUser = await getDbUser();

  const fileService = new FileService(dbUser.id);
  await fileService.deleteFile(fileId);

  return NextResponse.json({ success: true }, { status: 200 });
};

export const DELETE = withApiErrorHandling(
  deleteHandler,
  "DELETE /api/files/[fileId]",
);

/**
 * PATCH /api/files/[fileId]
 * Move a file to a different folder (updates DB only; R2 key unchanged).
 */
const patchHandler = async (
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) => {
  auth.protect();
  const { fileId } = await params;
  const dbUser = await getDbUser();
  const body: MoveFileApiRequest = await req.json();

  const fileService = new FileService(dbUser.id);
  const updatedFile = await fileService.moveFile(fileId, body.folderId);

  return NextResponse.json(updatedFile, { status: 200 });
};

export const PATCH = withApiErrorHandling(
  patchHandler,
  "PATCH /api/files/[fileId]",
);

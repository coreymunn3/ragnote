import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";
import { getDbUser } from "@/lib/getDbUser";
import { UpdateFolderNameApiRequest } from "@/lib/types/folderTypes";
import { FolderService } from "@/services/folder/folderService";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const folderService = new FolderService();

// Get a folder by its ID
const getHandler = async (
  req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) => {
  auth.protect();
  const { folderId } = await params;
  const dbUser = await getDbUser();
  const folder = await folderService.getFolderById(folderId, dbUser.id);
  return NextResponse.json(folder, { status: 200 });
};

export const GET = withApiErrorHandling(
  getHandler,
  "GET /api/folder/[folderId]"
);

// Change the folder's name
const putHandler = async (
  req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) => {
  auth.protect();
  const body: UpdateFolderNameApiRequest = await req.json();
  const { folderId } = await params;
  const dbUser = await getDbUser();
  // update the folder
  const upatedFolder = await folderService.renameFolder({
    folderId,
    userId: dbUser.id,
    newFolderName: body.folderName,
  });
  return NextResponse.json(upatedFolder, { status: 200 });
};

export const PUT = withApiErrorHandling(
  putHandler,
  "PUT /api/folder/[folderId]"
);

const deleteHandler = async (
  req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) => {
  auth.protect();
  const { folderId } = await params;
  const dbUser = await getDbUser();
  const deletedFolder = await folderService.softDeleteFolder(
    folderId,
    dbUser.id
  );
  return NextResponse.json(deletedFolder, { status: 200 });
};

export const DELETE = withApiErrorHandling(
  deleteHandler,
  "DELETE /api/folder/[folderId]"
);

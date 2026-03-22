import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";
import { getDbUser } from "@/lib/getDbUser";
import { UpdateFolderApiRequest } from "@/lib/types/folderTypes";
import { FolderService } from "@/services/folder/folderService";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const folderService = new FolderService();

// Get a folder by its ID
const getHandler = async (
  req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> },
) => {
  auth.protect();
  const { folderId } = await params;
  const dbUser = await getDbUser();
  const folder = await folderService.getFolderById(folderId, dbUser.id);
  return NextResponse.json(folder, { status: 200 });
};

export const GET = withApiErrorHandling(
  getHandler,
  "GET /api/folder/[folderId]",
);

// Update folder (rename or recover)
const putHandler = async (
  req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> },
) => {
  auth.protect();
  const body: UpdateFolderApiRequest = await req.json();
  const { folderId } = await params;
  const dbUser = await getDbUser();

  switch (body.action) {
    case "rename":
      if (!body.folderName) {
        return NextResponse.json(
          {
            success: false,
            message: "folderName is required for this operation",
          },
          {
            status: 400,
          },
        );
      }
      const updatedFolder = await folderService.renameFolder({
        folderId,
        userId: dbUser.id,
        newFolderName: body.folderName,
      });
      return NextResponse.json(updatedFolder, { status: 200 });
    case "recover":
      await folderService.recoverFolder(folderId, dbUser.id);
      return NextResponse.json({ success: true }, { status: 200 });
    default:
      return NextResponse.json({
        success: false,
        message: "action must be one of: rename, recover - or was not provided",
      });
  }
};

export const PUT = withApiErrorHandling(
  putHandler,
  "PUT /api/folder/[folderId]",
);

const deleteHandler = async (
  req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> },
) => {
  auth.protect();
  const { folderId } = await params;
  const dbUser = await getDbUser();
  await folderService.softDeleteFolder(folderId, dbUser.id);
  return NextResponse.json(
    {
      success: true,
    },
    { status: 200 },
  );
};

export const DELETE = withApiErrorHandling(
  deleteHandler,
  "DELETE /api/folder/[folderId]",
);

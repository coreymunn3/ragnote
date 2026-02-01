import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbUser } from "@/lib/getDbUser";
import { FolderService } from "@/services/folder/folderService";
import { CreateFolderApiRequest } from "@/lib/types/folderTypes";
import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";

const folderService = new FolderService();

/**
 * Create a new folder
 */
const postHandler = async (req: NextRequest) => {
  auth.protect();
  const dbUser = await getDbUser();
  const body: CreateFolderApiRequest = await req.json();
  const newFolder = await folderService.createFolder({
    userId: dbUser.id,
    folderName: body.folderName,
  });
  return NextResponse.json(newFolder, { status: 200 });
};

export const POST = withApiErrorHandling(postHandler, "POST /api/folder");

/**
 * Get all folders for this user
 */
const getHandler = async (req: NextRequest) => {
  auth.protect();
  const dbUser = await getDbUser();
  // get only the user-created folders
  const userFolders = await folderService.getUserCreatedFolders(dbUser.id);

  return NextResponse.json(userFolders, { status: 200 });
};

export const GET = withApiErrorHandling(getHandler, "GET /api/folder");

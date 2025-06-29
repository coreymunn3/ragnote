import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbUser } from "@/lib/getDbUser";
import { FolderService } from "@/services/folder/folderService";
import { CreateFolderApiRequest } from "@/lib/types/folderTypes";
import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";

const folderService = new FolderService();

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

const getHandler = async (req: NextRequest) => {
  auth.protect();
  const dbUser = await getDbUser();
  // get the user and system folders
  const [userFolders, systemFolders] = await Promise.all([
    folderService.getUserCreatedFolders(dbUser.id),
    folderService.getUserSystemFolders(dbUser.id),
  ]);

  return NextResponse.json(
    {
      user: userFolders,
      system: systemFolders,
    },
    { status: 200 }
  );
};

export const GET = withApiErrorHandling(getHandler, "GET /api/folder");

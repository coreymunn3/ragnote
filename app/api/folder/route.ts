import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbUser } from "@/lib/getDbUser";
import { FolderService } from "@/services/folder/folderService";
import { CreateFolderApiRequest } from "@/lib/types/folderTypes";
import { ApiError, InternalServerError } from "@/lib/errors/apiErrors";

const folderService = new FolderService();

export async function POST(req: NextRequest) {
  auth.protect();

  try {
    // get the authenticated user
    const dbUser = await getDbUser();
    const body: CreateFolderApiRequest = await req.json();
    // create the folder
    const newFolder = await folderService.createFolder({
      userId: dbUser.id,
      folderName: body.folderName,
    });
    // return the folder
    return NextResponse.json(newFolder, { status: 200 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    console.error("Unexpected error in POST /api/folder:", error);
    const internalError = new InternalServerError();
    return NextResponse.json(
      { error: internalError.message },
      { status: internalError.statusCode }
    );
  }
}

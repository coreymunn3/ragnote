import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getDbUser } from "@/lib/getDbUser";
import { FileService } from "@/services/file/fileService";
import { withApiErrorHandling } from "@/lib/errors/apiRouteHandlers";

const postHandler = async (req: NextRequest) => {
  auth.protect();
  const dbUser = await getDbUser();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folderId = formData.get("folderId") as string | undefined;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const fileService = new FileService(dbUser.id);
  const uploadedFile = await fileService.uploadFile({ file, folderId });

  return NextResponse.json(uploadedFile, { status: 201 });
};

export const POST = withApiErrorHandling(postHandler, "POST /api/files/upload");

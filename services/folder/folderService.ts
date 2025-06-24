import { prisma } from "@/lib/prisma";
import { createFolderSchema } from "./folderValidators";
import { CreateFolderRequest, FolderResponse } from "@/lib/types/folderTypes";
import { withErrorHandling } from "@/lib/errors/errorHandlers";

export class FolderService {
  public createFolder = withErrorHandling(
    async (data: CreateFolderRequest): Promise<FolderResponse> => {
      // Validate the request data
      const validatedData = createFolderSchema.parse(data);

      const newFolder = await prisma.folder.create({
        data: {
          folder_name: validatedData.folderName,
          user_id: validatedData.userId,
          is_deleted: false,
        },
      });

      return newFolder as FolderResponse;
    }
  );
}

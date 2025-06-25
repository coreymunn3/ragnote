import { prisma } from "@/lib/prisma";
import { createFolderSchema } from "./folderValidators";
import {
  CreateFolderRequest,
  PrismaFolder,
  GetAllFoldersRequest,
  FolderWithNotes,
} from "@/lib/types/folderTypes";
import { withErrorHandling } from "@/lib/errors/errorHandlers";
import { NoteService } from "../note/noteService";

export class FolderService {
  /** Create Folder */
  public createFolder = withErrorHandling(
    async (data: CreateFolderRequest): Promise<PrismaFolder> => {
      const validatedData = createFolderSchema.parse(data);
      // create the folder
      const newFolder = await prisma.folder.create({
        data: {
          folder_name: validatedData.folderName,
          user_id: validatedData.userId,
          is_deleted: false,
        },
      });

      return newFolder as PrismaFolder;
    }
  );

  /** Get All Folders */
  public getFoldersForUser = withErrorHandling(
    async (data: GetAllFoldersRequest): Promise<FolderWithNotes[]> => {
      const noteService = new NoteService();

      // Get all folders for this user that are not deleted
      const folders = await prisma.folder.findMany({
        where: {
          user_id: data.userId,
          is_deleted: false,
        },
      });

      // Get notes for each folder using Promise.all
      const foldersWithNotes = await Promise.all(
        folders.map(async (folder) => {
          const notes = await noteService.getAllNotesInFolder({
            folderId: folder.id,
            userId: data.userId,
          });

          return {
            ...folder,
            href: `/folder/${folder.id}`,
            notes,
          } as FolderWithNotes;
        })
      );

      return foldersWithNotes;
    }
  );
}

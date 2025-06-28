import { prisma } from "@/lib/prisma";
import { createFolderSchema } from "./folderValidators";
import {
  CreateFolderRequest,
  PrismaFolder,
  GetFoldersRequest,
  FolderWithNotes,
  SYSTEM_FOLDERS,
} from "@/lib/types/folderTypes";
import { withErrorHandling } from "@/lib/errors/errorHandlers";
import { NoteService } from "../note/noteService";

const noteService = new NoteService();
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

  /** Get All Folders created by the user */
  public getUserCreatedFolders = withErrorHandling(
    async (data: GetFoldersRequest): Promise<FolderWithNotes[]> => {
      // Get all folders for this user that are not deleted
      const folders = await prisma.folder.findMany({
        where: {
          user_id: data.userId,
          is_deleted: false,
        },
      });

      // Get notes for each folder using
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

  public getUserSystemFolders = withErrorHandling(
    async (data: GetFoldersRequest): Promise<FolderWithNotes[]> => {
      /**
       * System folders are not "real" folders like the user created folders.
       * Instead, they are artificial folders, just groups of notes presented to the user the same way a folder would be.
       */

      const systemFolders: PrismaFolder[] = [
        {
          id: SYSTEM_FOLDERS.SHARED.id,
          folder_name: SYSTEM_FOLDERS.SHARED.displayName,
          created_at: new Date(), // does not matter
          updated_at: new Date(), // does not matter
          user_id: data.userId, // does not matter
          is_deleted: false, // does not matter
        },
        {
          id: SYSTEM_FOLDERS.DELETED.id,
          folder_name: SYSTEM_FOLDERS.DELETED.displayName,
          created_at: new Date(),
          updated_at: new Date(),
          user_id: data.userId,
          is_deleted: false,
        },
      ];

      // get notes for each of the system folders
      const foldersWithNotes = await Promise.all(
        systemFolders.map(async (folder) => {
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

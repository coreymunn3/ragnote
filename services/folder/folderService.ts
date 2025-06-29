import { prisma } from "@/lib/prisma";
import {
  createFolderSchema,
  deleteFolderSchema,
  getFolderByIdSchema,
  renameFolderSchema,
} from "./folderValidators";
import {
  PrismaFolder,
  FolderWithNotes,
  SYSTEM_FOLDERS,
  SystemFolderId,
} from "@/lib/types/folderTypes";
import { withErrorHandling } from "@/lib/errors/errorHandlers";
import { NoteService } from "../note/noteService";
import { ForbiddenError, NotFoundError } from "@/lib/errors/apiErrors";

const noteService = new NoteService();
export class FolderService {
  /**
   * Enriches an array of folders with their associated notes and href properties
   * @param folders - Array of PrismaFolder objects to enrich
   * @param userId - User ID for fetching notes
   * @returns Promise resolving to array of FolderWithNotes
   */
  private enrichFoldersWithNotes = async (
    folders: PrismaFolder[],
    userId: string
  ): Promise<FolderWithNotes[]> => {
    // Get notes for each folder using noteService
    return Promise.all(
      folders.map(async (folder) => {
        const notes = await noteService.getAllNotesInFolder(folder.id, userId);

        return {
          ...folder,
          href: `/folder/${folder.id}`,
          notes,
        } as FolderWithNotes;
      })
    );
  };

  /**
   * Creates a system folder object with standard properties
   * @param systemFolderKey - Key from SYSTEM_FOLDERS constant
   * @param userId - User ID (used for consistency, though not meaningful for system folders)
   * @returns PrismaFolder object representing the system folder
   */
  private createSystemFolder = (
    systemFolderKey: keyof typeof SYSTEM_FOLDERS,
    userId: string
  ): PrismaFolder => {
    const systemFolder = SYSTEM_FOLDERS[systemFolderKey];
    const now = new Date();

    return {
      id: systemFolder.id,
      folder_name: systemFolder.displayName,
      created_at: now, // does not matter
      updated_at: now, // does not matter
      user_id: userId, // does not matter
      is_deleted: false, // does not matter
    };
  };

  /**
   * Determines if a folder ID represents a system folder
   * @param folderId - The folder ID to check
   * @returns True if the folder ID is a system folder
   */
  public static isSystemFolder(folderId: string): folderId is SystemFolderId {
    return folderId.startsWith("system:");
  }

  /**
   * Maps system folder ID to SYSTEM_FOLDERS key
   * @param systemFolderId - The system folder ID
   * @returns The corresponding key from SYSTEM_FOLDERS
   */
  private getSystemFolderKey(
    systemFolderId: string
  ): keyof typeof SYSTEM_FOLDERS {
    switch (systemFolderId) {
      case SYSTEM_FOLDERS.SHARED.id:
        return "SHARED";
      case SYSTEM_FOLDERS.DELETED.id:
        return "DELETED";
      default:
        throw new NotFoundError(`Unknown system folder: ${systemFolderId}`);
    }
  }

  /** Create Folder */
  public createFolder = withErrorHandling(
    async (params: {
      folderName: string;
      userId: string;
    }): Promise<PrismaFolder> => {
      const validatedData = createFolderSchema.parse(params);
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

  /** Rename the folder */
  public renameFolder = withErrorHandling(
    async (params: {
      folderId: string;
      newFolderName: string;
      userId: string;
    }): Promise<PrismaFolder> => {
      const validatedData = renameFolderSchema.parse(params);
      // attempt to update the name
      const updatedFolder = await prisma.folder.update({
        where: {
          id: validatedData.folderId,
          user_id: validatedData.userId,
          is_deleted: false,
        },
        data: {
          folder_name: validatedData.newFolderName,
        },
      });
      // throw error is nothing happened
      if (!updatedFolder) {
        throw new NotFoundError(
          `Folder ${validatedData.folderId} belonging to user ${validatedData.userId} not found`
        );
      }
      return updatedFolder;
    }
  );

  /** Soft Delete the folder by setting is_deleted to true */
  public softDeleteFolder = withErrorHandling(
    async (folderId: string, userId: string) => {
      const validatedData = deleteFolderSchema.parse({
        folderId,
        userId,
      });
      // attempt to delete the foler
      const updatedFolder = await prisma.folder.update({
        where: {
          id: validatedData.folderId,
          user_id: validatedData.userId,
        },
        data: {
          is_deleted: true,
        },
      });
      // throw error is nothing happened
      if (!updatedFolder) {
        throw new NotFoundError(
          `Folder ${validatedData.folderId} belonging to user ${validatedData.userId} not found`
        );
      }
      return updatedFolder;
    }
  );

  /** Get All Folders created by the user */
  public getUserCreatedFolders = withErrorHandling(
    async (userId: string): Promise<FolderWithNotes[]> => {
      // Get all folders for this user that are not deleted
      const folders = await prisma.folder.findMany({
        where: {
          user_id: userId,
          is_deleted: false,
        },
      });

      // Get notes for each folder using the helper method
      return await this.enrichFoldersWithNotes(folders, userId);
    }
  );

  public getUserSystemFolders = withErrorHandling(
    async (userId: string): Promise<FolderWithNotes[]> => {
      /**
       * System folders are not "real" folders like the user created folders.
       * Instead, they are artificial folders, just groups of notes presented to the user the same way a folder would be.
       */

      const systemFolders: PrismaFolder[] = [
        this.createSystemFolder("SHARED", userId),
        this.createSystemFolder("DELETED", userId),
      ];

      // get notes for each of the system folders using the helper method
      return await this.enrichFoldersWithNotes(systemFolders, userId);
    }
  );

  /** Get a single folder by ID with its notes */
  public getFolderById = withErrorHandling(
    async (folderId: string, userId: string): Promise<FolderWithNotes> => {
      const validatedData = getFolderByIdSchema.parse({ folderId, userId });

      // Check if this is a system folder
      if (FolderService.isSystemFolder(validatedData.folderId)) {
        const systemFolder = this.createSystemFolder(
          this.getSystemFolderKey(validatedData.folderId),
          validatedData.userId
        );
        const enrichedFolders = await this.enrichFoldersWithNotes(
          [systemFolder],
          validatedData.userId
        );
        return enrichedFolders[0];
      }

      // For regular folders, fetch from database
      const folder = await prisma.folder.findFirst({
        where: {
          id: validatedData.folderId,
          user_id: validatedData.userId,
          is_deleted: false,
        },
      });

      if (!folder) {
        throw new NotFoundError("Folder not found or access denied");
      }

      // Use existing helper to enrich with notes
      const enrichedFolders = await this.enrichFoldersWithNotes(
        [folder],
        validatedData.userId
      );
      return enrichedFolders[0];
    }
  );
}

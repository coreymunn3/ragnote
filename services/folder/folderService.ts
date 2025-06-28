import { prisma } from "@/lib/prisma";
import { createFolderSchema, getFolderByIdSchema } from "./folderValidators";
import {
  CreateFolderRequest,
  PrismaFolder,
  GetFoldersRequest,
  FolderWithNotes,
  SYSTEM_FOLDERS,
  SystemFolderId,
  GetFolderByIdRequest,
} from "@/lib/types/folderTypes";
import { withErrorHandling } from "@/lib/errors/errorHandlers";
import { NoteService } from "../note/noteService";
import { NotFoundError } from "@/lib/errors/apiErrors";

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
        const notes = await noteService.getAllNotesInFolder({
          folderId: folder.id,
          userId,
        });

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

      // Get notes for each folder using the helper method
      return await this.enrichFoldersWithNotes(folders, data.userId);
    }
  );

  public getUserSystemFolders = withErrorHandling(
    async (data: GetFoldersRequest): Promise<FolderWithNotes[]> => {
      /**
       * System folders are not "real" folders like the user created folders.
       * Instead, they are artificial folders, just groups of notes presented to the user the same way a folder would be.
       */

      const systemFolders: PrismaFolder[] = [
        this.createSystemFolder("SHARED", data.userId),
        this.createSystemFolder("DELETED", data.userId),
      ];

      // get notes for each of the system folders using the helper method
      return await this.enrichFoldersWithNotes(systemFolders, data.userId);
    }
  );

  /** Get a single folder by ID with its notes */
  public getFolderById = withErrorHandling(
    async (data: GetFolderByIdRequest): Promise<FolderWithNotes> => {
      const validatedData = getFolderByIdSchema.parse(data);

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

import { prisma } from "@/lib/prisma";
import {
  createFolderSchema,
  deleteFolderSchema,
  getFolderByIdSchema,
  renameFolderSchema,
} from "./folderValidators";
import {
  PrismaFolder,
  FolderWithItems,
  FolderItemType,
  SYSTEM_FOLDERS,
  SystemFolderId,
} from "@/lib/types/folderTypes";
import { withErrorHandling } from "@/lib/errors/errorHandlers";
import { NoteService } from "../note/noteService";
import { ChatService } from "../chat/chatService";
import { ForbiddenError, NotFoundError } from "@/lib/errors/apiErrors";
import { isSystemFolder, getSystemFolderKey } from "@/lib/utils/folderUtils";

const noteService = new NoteService();
const chatService = new ChatService();
export class FolderService {
  /**
   * Enriches an array of folders with their associated items and href properties
   * @param folders - Array of PrismaFolder objects to enrich
   * @param userId - User ID for fetching items
   * @param itemType - Type of items to fetch ('note' or 'chat')
   * @returns Promise resolving to array of FolderWithItems
   */
  private enrichFoldersWithItems = async (
    folders: PrismaFolder[],
    userId: string,
    itemType: FolderItemType
  ): Promise<FolderWithItems[]> => {
    return Promise.all(
      folders.map(async (folder) => {
        let items: any[];
        let href: string;

        switch (itemType) {
          case "note":
            items = await noteService.getAllNotesInFolder(folder.id, userId);
            href = `/folder/${folder.id}`;
            break;
          case "chat":
            items = await chatService.getChatSessionsForUser({ userId });
            href = `/chat`;
            break;
          default:
            items = [];
            href = `/folder/${folder.id}`;
        }

        return {
          ...folder,
          href,
          items,
          itemType,
        } as FolderWithItems;
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
    async (userId: string): Promise<FolderWithItems[]> => {
      // Get all folders for this user that are not deleted
      const folders = await prisma.folder.findMany({
        where: {
          user_id: userId,
          is_deleted: false,
        },
      });

      // Get notes for each folder using the helper method
      return await this.enrichFoldersWithItems(folders, userId, "note");
    }
  );

  public getUserSystemFolders = withErrorHandling(
    async (userId: string): Promise<FolderWithItems[]> => {
      /**
       * System folders are not "real" folders like the user created folders.
       * Instead, they are artificial folders, just groups of items presented to the user the same way a folder would be.
       */

      // Handle each system folder separately since they need different enrichment types
      const sharedFolder = await this.enrichFoldersWithItems(
        [this.createSystemFolder("SHARED", userId)],
        userId,
        "note"
      );

      const deletedFolder = await this.enrichFoldersWithItems(
        [this.createSystemFolder("DELETED", userId)],
        userId,
        "note"
      );

      const chatsFolder = await this.enrichFoldersWithItems(
        [this.createSystemFolder("CHATS", userId)],
        userId,
        "chat"
      );

      return [...sharedFolder, ...deletedFolder, ...chatsFolder];
    }
  );

  /** Get a single folder by ID with its items */
  public getFolderById = withErrorHandling(
    async (folderId: string, userId: string): Promise<FolderWithItems> => {
      const validatedData = getFolderByIdSchema.parse({ folderId, userId });

      // Check if this is a system folder
      if (isSystemFolder(validatedData.folderId)) {
        const systemFolderKey = getSystemFolderKey(validatedData.folderId);
        const systemFolder = this.createSystemFolder(
          systemFolderKey,
          validatedData.userId
        );

        // Determine item type based on system folder
        const itemType: FolderItemType =
          systemFolderKey === "CHATS" ? "chat" : "note";

        const enrichedFolders = await this.enrichFoldersWithItems(
          [systemFolder],
          validatedData.userId,
          itemType
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
      const enrichedFolders = await this.enrichFoldersWithItems(
        [folder],
        validatedData.userId,
        "note"
      );
      return enrichedFolders[0];
    }
  );
}

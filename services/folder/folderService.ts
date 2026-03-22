import { prisma } from "@/lib/prisma";
import {
  createFolderSchema,
  deleteFolderSchema,
  getFolderByIdSchema,
  renameFolderSchema,
  recoverFolderSchema,
  getDeletedFoldersSchema,
} from "./folderValidators";
import {
  PrismaFolder,
  FolderWithItems,
  FolderItemType,
} from "@/lib/types/folderTypes";
import { withErrorHandling } from "@/lib/errors/errorHandlers";
import { NoteService } from "../note/noteService";
import { ChatService } from "../chat/chatService";
import { ForbiddenError, NotFoundError } from "@/lib/errors/apiErrors";
import { DateTime } from "luxon";
import { Note } from "@/lib/types/noteTypes";

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
    itemType: FolderItemType,
  ): Promise<FolderWithItems[]> => {
    return Promise.all(
      folders.map(async (folder) => {
        let items: any[];
        let href: string;

        switch (itemType) {
          case "note":
            const noteService = new NoteService();
            const allNotes = await noteService.getAllNotesInFolder(
              folder.id,
              userId,
            );
            // Sort notes by most recent edit time (note.updated_at or current_version.updated_at)
            items = allNotes.sort((a: Note, b: Note) => {
              const getNoteMostRecentDateTime = (note: Note) => {
                const noteUpdated = DateTime.fromJSDate(note.updated_at);
                const versionUpdated = note.current_version
                  ? DateTime.fromJSDate(note.current_version.updated_at)
                  : DateTime.fromMillis(0);
                return DateTime.max(noteUpdated, versionUpdated);
              };

              const aTime = getNoteMostRecentDateTime(a);
              const bTime = getNoteMostRecentDateTime(b);
              return bTime.toMillis() - aTime.toMillis(); // Descending order (most recent first)
            });
            href = `/folder/${folder.id}`;
            break;
          case "chat":
            const chatService = new ChatService();
            const allItems = await chatService.getChatSessionsForUser({
              userId,
            });
            // Sort chats by most recent update time
            items = allItems.sort((a: any, b: any) => {
              const aTime = DateTime.fromISO(a.updated_at);
              const bTime = DateTime.fromISO(b.updated_at);
              return bTime.toMillis() - aTime.toMillis(); // Descending order (most recent first)
            });
            href = `/folder/${folder.id}`;
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
      }),
    );
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
    },
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
          `Folder ${validatedData.folderId} belonging to user ${validatedData.userId} not found`,
        );
      }
      return updatedFolder;
    },
  );

  /** Soft Delete the folder by setting is_deleted to true and cascade to notes */
  public softDeleteFolder = withErrorHandling(
    async (folderId: string, userId: string) => {
      const validatedData = deleteFolderSchema.parse({
        folderId,
        userId,
      });

      // Verify folder exists and belongs to user
      const folder = await prisma.folder.findFirst({
        where: {
          id: validatedData.folderId,
          user_id: validatedData.userId,
        },
      });

      if (!folder) {
        throw new NotFoundError(
          `Folder ${validatedData.folderId} belonging to user ${validatedData.userId} not found`,
        );
      }

      // CASCADE: Delete folder AND all notes inside in a transaction
      await prisma.$transaction([
        // Delete the folder
        prisma.folder.update({
          where: { id: validatedData.folderId },
          data: { is_deleted: true },
        }),
        // Delete all notes in the folder
        prisma.note.updateMany({
          where: {
            folder_id: validatedData.folderId,
            user_id: validatedData.userId,
          },
          data: {
            is_deleted: true,
            is_pinned: false,
          },
        }),
      ]);

      return folder;
    },
  );

  /** Recover a soft deleted folder and all notes inside it */
  public recoverFolder = withErrorHandling(
    async (folderId: string, userId: string) => {
      const validatedData = recoverFolderSchema.parse({
        folderId,
        userId,
      });

      // Verify folder exists, belongs to user, and is deleted
      const folder = await prisma.folder.findFirst({
        where: {
          id: validatedData.folderId,
          user_id: validatedData.userId,
          is_deleted: true,
        },
      });

      if (!folder) {
        throw new NotFoundError(
          `Folder ${validatedData.folderId} not found or not yet deleted`,
        );
      }

      // CASCADE: Recover folder AND all notes inside in a transaction
      await prisma.$transaction([
        // Recover the folder
        prisma.folder.update({
          where: { id: validatedData.folderId },
          data: { is_deleted: false },
        }),
        // Recover all notes in the folder
        prisma.note.updateMany({
          where: {
            folder_id: validatedData.folderId,
            user_id: validatedData.userId,
          },
          data: {
            is_deleted: false,
          },
        }),
      ]);

      return folder;
    },
  );

  /** Get all deleted folders for a user */
  public getDeletedFolders = withErrorHandling(
    async (userId: string): Promise<PrismaFolder[]> => {
      const { userId: validatedUserId } = getDeletedFoldersSchema.parse({
        userId,
      });

      const folders = await prisma.folder.findMany({
        where: {
          user_id: validatedUserId,
          is_deleted: true,
        },
        orderBy: {
          updated_at: "desc",
        },
      });

      return folders;
    },
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
    },
  );

  /** Get a single folder by ID with its items */
  public getFolderById = withErrorHandling(
    async (folderId: string, userId: string): Promise<FolderWithItems> => {
      const validatedData = getFolderByIdSchema.parse({ folderId, userId });

      // Fetch folder from database (including deleted folders for preview)
      const folder = await prisma.folder.findFirst({
        where: {
          id: validatedData.folderId,
          user_id: validatedData.userId,
          // Removed is_deleted filter to allow viewing deleted folders
        },
      });

      if (!folder) {
        throw new NotFoundError("Folder not found or access denied");
      }

      // Enrich with notes
      const enrichedFolders = await this.enrichFoldersWithItems(
        [folder],
        validatedData.userId,
        "note",
      );
      return enrichedFolders[0];
    },
  );
}

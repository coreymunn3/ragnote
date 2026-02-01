import { withErrorHandling } from "@/lib/errors/errorHandlers";
import { NoteService } from "../note/noteService";
import { FolderService } from "../folder/folderService";
import { ChatService } from "../chat/chatService";
import { DeletedItemsCollection } from "@/lib/types/deletedTypes";
import { getDeletedItemsSchema } from "./deletedItemsValidators";

export class DeletedItemsService {
  /**
   * Get all deleted items for a user (notes, folders, chats)
   * Organized by type for sectioned display
   */
  public getDeletedItems = withErrorHandling(
    async (userId: string): Promise<DeletedItemsCollection> => {
      // Validate input
      const { userId: validatedUserId } = getDeletedItemsSchema.parse({
        userId,
      });

      const noteService = new NoteService();
      const folderService = new FolderService();
      const chatService = new ChatService();

      // Fetch all deleted items in parallel
      const [notes, folders, chats] = await Promise.all([
        noteService.getDeletedNotes(validatedUserId),
        folderService.getDeletedFolders(validatedUserId),
        chatService.getDeletedChats(validatedUserId),
      ]);

      return {
        notes,
        folders,
        chats,
        counts: {
          notes: notes.length,
          folders: folders.length,
          chats: chats.length,
          total: notes.length + folders.length + chats.length,
        },
      };
    }
  );
}

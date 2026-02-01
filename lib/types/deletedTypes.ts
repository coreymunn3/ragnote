import { Note } from "./noteTypes";
import { PrismaFolder } from "./folderTypes";
import { ChatSession } from "./chatTypes";

/**
 * Collection of all deleted items, organized by type
 * Used by the Recently Deleted page to display items in sections
 */
export interface DeletedItemsCollection {
  notes: Note[];
  folders: PrismaFolder[];
  chats: ChatSession[];
  counts: {
    notes: number;
    folders: number;
    chats: number;
    total: number;
  };
}

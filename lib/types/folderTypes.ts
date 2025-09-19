import { Note } from "./noteTypes";
import { ChatSession } from "./chatTypes";
import { Expand } from "./sharedTypes";

export const SYSTEM_FOLDERS = {
  SHARED: {
    id: "system_shared",
    displayName: "Shared With You",
  },
  DELETED: {
    id: "system_deleted",
    displayName: "Recently Deleted",
  },
  CHATS: {
    id: "system_chats",
    displayName: "Chats",
  },
};
export type SystemFolderId =
  | "system_shared"
  | "system_deleted"
  | "system_chats";

export type PrismaFolder = {
  id: string;
  user_id: string;
  folder_name: string;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
};

export type FolderItemType = "note" | "chat";
export type FolderWithItems = Expand<
  PrismaFolder & {
    href: string;
    items: (Note | ChatSession)[];
    itemType: FolderItemType;
  }
>;

/**
 * Request Types for Folder APIs
 */
export type CreateFolderApiRequest = {
  folderName: string;
};

export type UpdateFolderNameApiRequest = {
  folderName: string;
};

import { Note } from "./noteTypes";

export const SYSTEM_FOLDERS = {
  SHARED: {
    id: "system:shared",
    displayName: "Shared With You",
  },
  DELETED: {
    id: "system:deleted",
    displayName: "Recently Deleted",
  },
};
export type SystemFolderId = "system:shared" | "system:deleted";

export type PrismaFolder = {
  id: string;
  user_id: string;
  folder_name: string;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
};

export type FolderWithNotes = PrismaFolder & {
  href: string;
  notes: Note[];
};

/**
 * Request Types for Folder APIs
 */
export type CreateFolderApiRequest = {
  folderName: string;
};

/**
 * Request Types for Folder Service
 */
export type CreateFolderRequest = CreateFolderApiRequest & {
  userId: string;
};

export type GetFoldersRequest = {
  userId: string;
};

/**
 * Response Types for Note Service
 */

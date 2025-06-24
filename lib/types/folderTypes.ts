import { Note } from "./noteTypes";

export type Folder = {
  id: string;
  folder_name: string;
  link: string;
  notes: Note[];
};

/**
 * Request Types for Folder Service
 */
export type CreateFolderRequest = {
  userId: string;
  folderName: string;
};

/**
 * Response Types for Note Service
 */
export type FolderResponse = {
  id: string;
  user_id: string;
  folder_name: string;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
};

import { Expand } from "./sharedTypes";

export type Note = {
  id: string;
  title: string;
  current_version: {
    id: string;
    version_number: number;
    is_published: boolean;
    published_at: Date | null;
  };
  is_pinned: boolean;
  is_deleted: boolean;
  updated_at: Date;
  created_at: Date;
  shared_with_count: number;
  preview: string;
};

export type NoteVersion = {
  id: string;
  version_number: number;
  is_published: boolean;
  published_at: Date;
  created_at: Date;
};

export type NoteVersionWithContent = Expand<
  NoteVersion & {
    content: any;
  }
>;

/**
 * Request Types for Notes API
 */
export type CreateNoteApiRequest = {
  title: string;
  folderId?: string;
};

/**
 * Response Types for Note Service
 */
export type PrismaNote = {
  id: string;
  user_id: string;
  folder_id: string | null;
  title: string;
  current_version_id: string | null;
  is_pinned: boolean;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
};

export type PrismaNoteWithVersionPreview = {
  id: string;
  user_id: string;
  folder_id: string | null;
  title: string;
  current_version_id: string | null;
  is_pinned: boolean;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  current_version: {
    id: string;
    version_number: number;
    is_published: boolean;
    published_at: Date | null;
  } | null;
  _count: {
    permissions: number;
  };
  preview: string;
};

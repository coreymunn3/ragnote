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
};

export type NoteVersion = {
  id: string;
  version_number: number;
  is_published: boolean;
  published_at: Date;
  created_at: Date;
};

export type NoteVersionWithContent = NoteVersion & {
  content: any;
};

/**
 * Request Types for Note Service
 */
export type CreateNoteRequest = {
  userId: string;
  folderId?: string;
  title: string;
  content: string;
};

export type GetNotesInFolderRequest = {
  userId: string;
  folderId: string;
};

export type GetSystemNotesRequeset = {
  userId: string;
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

export type PrismaNoteWithVersion = {
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
};

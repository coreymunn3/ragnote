import { Expand } from "./sharedTypes";

/**
 * Simplified & Safe types for frontend
 */
export type Note = {
  id: string;
  folder_id: string;
  title: string;
  current_version: {
    id: string;
    updated_at: Date;
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

export type NoteVersionWithoutContent = {
  id: string;
  version_number: number;
  is_published: boolean;
  published_at: Date | null;
};

export type NoteVersionWithContent = Expand<
  NoteVersionWithoutContent & {
    rich_text_content: any;
    plain_text_content: string;
  }
>;

export type NoteContent = {
  plainTextContent: string;
  richTextContent: any;
};

export type PublishNoteResponse = {
  publishedVersion: PrismaNoteVersion;
  nextVersion: PrismaNoteVersion;
};

/**
 * Request Types for Notes API
 */
export type CreateNoteApiRequest = {
  title: string;
  folderId?: string;
};

export type UpdateNoteApiRequest = {
  action: "toggle_pin" | "move" | "delete" | "update_title";
  folderId?: string; // required for the 'move' operation
  title?: string; // required for the 'rename' operation
};

export type UpdateNoteVersionContentApiRequest = {
  richTextContent: any;
};

/**
 * Prisma Types - full schema-identical prisma objects
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

export type PrismaNoteVersion = {
  id: string;
  note_id: string;
  version_number: number;
  rich_text_content: any;
  plain_text_content: string;
  is_published: boolean;
  published_at: Date | null;
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
    updated_at: Date;
    version_number: number;
    is_published: boolean;
    published_at: Date | null;
  } | null;
  _count: {
    permissions: number;
  };
  preview: string;
};

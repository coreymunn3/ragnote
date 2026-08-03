import { FileType } from "@prisma/client";

export { FileType };

export type PrismaFile = {
  id: string;
  user_id: string;
  folder_id: string | null;
  file_name: string;
  file_type: FileType;
  storage_key: string | null;
  file_size_bytes: number | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  is_processed: boolean;
  processing_error: string | null;
  last_indexed_at: Date | null;
  is_deleted: boolean;
  uploaded_at: Date;
  updated_at: Date;
};

export type StorageUsage = {
  used: number;
  total: number;
  percentage: number;
};

type FileTypeConfig = {
  mimeTypes: string[];
  extensions: string[];
  maxSizeMB: number;
  canInlineRender: boolean;
};

export const FILE_TYPE_CONFIGS: Record<FileType, FileTypeConfig> = {
  IMAGE: {
    mimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    extensions: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    maxSizeMB: 10,
    canInlineRender: true,
  },
  PDF: {
    mimeTypes: ["application/pdf"],
    extensions: [".pdf"],
    maxSizeMB: 10,
    canInlineRender: false,
  },
  TEXT: {
    mimeTypes: ["text/plain", "text/markdown"],
    extensions: [".txt", ".md"],
    maxSizeMB: 10,
    canInlineRender: false,
  },
  // Existing enum values kept for DB compatibility — not yet supported for upload
  DOCX: {
    mimeTypes: [],
    extensions: [],
    maxSizeMB: 0,
    canInlineRender: false,
  },
  AUDIO: {
    mimeTypes: [],
    extensions: [],
    maxSizeMB: 0,
    canInlineRender: false,
  },
};

/**
 * Request Types for File APIs
 */
export type UploadFileApiRequest = {
  file: File;
  folderId?: string;
};

export type MoveFileApiRequest = {
  folderId: string | null;
};

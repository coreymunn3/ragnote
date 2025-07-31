export type ChatSession = {
  id: string;
  title: string;
  is_pinned: boolean;
  is_deleted: boolean;
  updated_at: Date;
  created_at: Date;
  messages_count: number;
};

export type SimpleChat = {
  sender_type: "USER" | "AI";
  content: string;
  created_at: Date;
};

export type ChatScope = "note" | "folder" | "global";
export type ChatScopeId = string | null;
export type ChatScopeObject = {
  scope: ChatScope;
  scopeId: ChatScopeId;
  noteVersions: Array<{
    noteId: string;
    versionId: string;
  }>;
};

/**
 * Prisma Types - full schema-identical prisma objects
 */
export type PrismaChatSession = {
  id: string;
  user_id: string;
  title: string | null;
  chat_scope: ChatScopeObject;
  note_id: string | null;
  folder_id: string | null;
  is_pinned: boolean;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
};

export type PrismaChatMessage = {
  id: string;
  chat_session_id: string;
  sender_type: "USER" | "AI";
  content: string;
  referenced_note_chunk_ids: string[];
  referenced_file_chunk_ids: string[];
  created_at: Date;
};

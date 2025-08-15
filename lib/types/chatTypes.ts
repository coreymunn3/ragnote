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

export type SendChatResponse = {
  session: PrismaChatSession;
  userMessage: PrismaChatMessage;
  aiMessage: PrismaChatMessage;
};

export type LlmSource = {
  chunkId: string; // node.id_
  noteId: string; // node.metadata.note_id
  noteTitle: string; // node.metadata.note_title
  chunkIndex: number; // node.metadata.chunk_index
  noteVersionId: string; // node.metadata.note_version_id
  textSnippet: string; // node.text (maybe truncated)
  relevanceScore: number; // score
};

/**
 * Request Types for Chat related APIs
 */
export type SendChatWithNoteApiRequest = {
  message: string;
  sessionId?: string;
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
  created_at: Date;
  llm_response?: any;
  llm_sources?: LlmSource[];
};

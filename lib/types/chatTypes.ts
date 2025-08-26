export type ChatSession = {
  id: string;
  user_id: string;
  title: string | null;
  chat_scope: ChatScopeObject;
  note_id: string | null;
  folder_id: string | null;
  is_pinned: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  messages_count: number;
  preview: string | null;
};

export type ChatMessage = {
  id: string;
  chat_session_id: string;
  sender_type: "USER" | "AI";
  content: string;
  created_at: Date;
  llm_response?: any;
  llm_sources?: LlmSource[];
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
  session: ChatSession;
  userMessage: ChatMessage;
  aiMessage: ChatMessage;
};

/**
 * Frontend-optimized message type for chat UI
 */
export type ChatDisplayMessage = {
  id: string;
  sender_type: "USER" | "AI";
  content: string;
  created_at: string; // serialized datetime string
  status?: "optimistic" | "thinking" | "sent" | "error";
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
  chat_scope: any; // Raw JSON from database
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
  llm_response?: any; // Raw JSON from database
  llm_sources?: any; // Raw JSON from database
};

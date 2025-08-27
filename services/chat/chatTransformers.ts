import {
  PrismaChatMessage,
  LlmSource,
  PrismaChatSession,
  ChatScopeObject,
  ChatMessage,
  ChatSession,
} from "@/lib/types/chatTypes";
import { prisma } from "@/lib/prisma";

/**
 * Transforms a PrismaChatMessage to the application ChatMessage type
 * Properly types the JSON fields
 */
export const transformToChatMessage = (
  prismaChatMessage: PrismaChatMessage
): ChatMessage => {
  return {
    id: prismaChatMessage.id,
    chat_session_id: prismaChatMessage.chat_session_id,
    sender_type: prismaChatMessage.sender_type,
    content: prismaChatMessage.content,
    created_at: prismaChatMessage.created_at.toISOString(),
    llm_response: prismaChatMessage.llm_response,
    llm_sources: prismaChatMessage.llm_sources as LlmSource[] | undefined,
  };
};

/**
 * Transforms a PrismaChatSession to the application ChatSession type
 * Properly types the JSON fields and adds the messages_count property
 */
export const transformToChatSession = async (
  prismaChatSession: PrismaChatSession
): Promise<ChatSession> => {
  // Get message count for this session
  const messagesCount = await prisma.chat_message.count({
    where: {
      chat_session_id: prismaChatSession.id,
    },
  });

  // get first user message for preview
  const firstUserMessage = await prisma.chat_message.findFirst({
    where: {
      chat_session_id: prismaChatSession.id,
      sender_type: "USER",
    },
    orderBy: {
      created_at: "asc",
    },
  });

  return {
    id: prismaChatSession.id,
    user_id: prismaChatSession.user_id,
    title: prismaChatSession.title,
    chat_scope: prismaChatSession.chat_scope as ChatScopeObject,
    note_id: prismaChatSession.note_id,
    folder_id: prismaChatSession.folder_id,
    is_pinned: prismaChatSession.is_pinned,
    is_deleted: prismaChatSession.is_deleted,
    created_at: prismaChatSession.created_at.toISOString(),
    updated_at: prismaChatSession.updated_at.toISOString(),
    messages_count: messagesCount,
    preview: firstUserMessage?.content.substring(0, 50) || "",
  };
};

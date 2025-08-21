import {
  PrismaChatMessage,
  LlmSource,
  PrismaChatSession,
  ChatScopeObject,
} from "@/lib/types/chatTypes";

/**
 * Transforms a Prisma chat message result to the PrismaChatMessage type expected by the application
 * Handles type casting for JSON fields like llm_sources
 */
export const transformToChatMessage = (rawMessage: any): PrismaChatMessage => {
  return {
    ...rawMessage,
    llm_sources: rawMessage.llm_sources as LlmSource[] | undefined,
  };
};

/**
 * Transforms a raw prisma chat session to the refined PrismaChatSesson type expected by the application
 * by casting the chat_scope json field to ChatScopeObject
 * @param session
 * @returns
 */
export const transformToChatSession = (session: any): PrismaChatSession => {
  return {
    ...session,
    chat_scope: session.chat_scope as ChatScopeObject,
  };
};

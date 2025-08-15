import { PrismaChatMessage, LlmSource } from "@/lib/types/chatTypes";

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

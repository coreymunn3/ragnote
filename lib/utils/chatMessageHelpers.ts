import { ChatDisplayMessage, PrismaChatMessage } from "@/lib/types/chatTypes";

/**
 * Convert Prisma message to display message
 */
export function fromPrismaMessage(
  prismaMessage: PrismaChatMessage
): ChatDisplayMessage {
  return {
    id: prismaMessage.id,
    sender_type: prismaMessage.sender_type,
    content: prismaMessage.content,
    created_at: prismaMessage.created_at,
    status: "sent",
  };
}

/**
 * Create optimistic user message
 */
export function createOptimisticUserMessage(
  content: string
): ChatDisplayMessage {
  return {
    id: `temp-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    sender_type: "USER",
    content,
    created_at: new Date(),
    status: "optimistic",
  };
}

/**
 * Create thinking message
 */
export function createThinkingMessage(): ChatDisplayMessage {
  return {
    id: `thinking-ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    sender_type: "AI",
    content: "",
    created_at: new Date(),
    status: "thinking",
  };
}

/**
 * Convert array of Prisma messages to display messages
 */
export function fromPrismaMessageArray(
  prismaMessages: PrismaChatMessage[]
): ChatDisplayMessage[] {
  return prismaMessages.map(fromPrismaMessage);
}

/**
 * Check if message is temporary (optimistic or thinking)
 */
export function isTemporaryMessage(message: ChatDisplayMessage): boolean {
  return message.status === "optimistic" || message.status === "thinking";
}

/**
 * Check if message is thinking
 */
export function isThinkingMessage(message: ChatDisplayMessage): boolean {
  return message.status === "thinking";
}

import { ChatDisplayMessage, ChatMessage } from "@/lib/types/chatTypes";
import { DateTime } from "luxon";

/**
 * Convert ChatMessage to display message format for UI
 */
export function toDisplayMessage(message: ChatMessage): ChatDisplayMessage {
  return {
    id: message.id,
    sender_type: message.sender_type,
    content: message.content,
    created_at:
      DateTime.fromJSDate(message.created_at).toISO() ||
      new Date().toISOString(),
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
    created_at: DateTime.now().toISO() || new Date().toISOString(),
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
    created_at: DateTime.now().toISO() || new Date().toISOString(),
    status: "thinking",
  };
}

/**
 * Convert array of ChatMessages to display messages
 */
export function toDisplayMessageArray(
  messages: ChatMessage[]
): ChatDisplayMessage[] {
  return messages.map(toDisplayMessage);
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

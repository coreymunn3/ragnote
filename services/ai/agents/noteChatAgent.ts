import { ChatScopeObject, ChatMessage } from "@/lib/types/chatTypes";
import { openai } from "@llamaindex/openai";
import { agent } from "@llamaindex/workflow";
import { createRagTool } from "./tools/ragTool";

export const createNoteChatAgent = async (
  userId: string,
  scope: ChatScopeObject,
  messageHistory?: ChatMessage[]
) => {
  const tools = await getNoteChatTools(userId, scope);

  // Build system prompt with conversation history if provided
  let systemPrompt = `You are an intelligent note assistant that helps users interact with their personal knowledge base. You have access to specialized tools that allow you to:

- Search through notes to find specific information, facts, and relevant content
- Analyze and process note content to answer questions
- Help users understand and work with their notes effectively

When a user asks a question or makes a request:
1. Consider what information you need to provide a helpful response
2. Use the appropriate tools available to you to gather or process information
3. Provide clear, accurate, and contextually relevant answers
4. Reference specific information from the user's notes when applicable
5. Be conversational and helpful while staying focused on the user's notes and knowledge

Remember: You are working with the user's personal notes and should respect their content while being as helpful as possible.`;

  if (messageHistory && messageHistory.length > 0) {
    const conversationContext = messageHistory
      .map((msg) => `${msg.sender_type}: ${msg.content}`)
      .join("\n");

    systemPrompt += `\n\n--- Previous Conversation ---\n${conversationContext}\n\nUse this conversation history to provide contextually aware responses and maintain conversation continuity.`;
  }

  return agent({
    tools,
    llm: openai({ model: "gpt-4o-mini" }),
    systemPrompt,
  });
};

const getNoteChatTools = async (userId: string, scope: ChatScopeObject) => [
  await createRagTool(userId, scope),
  // summaryTool(userId, scope) // TO DO
];

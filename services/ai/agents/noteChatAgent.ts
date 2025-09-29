import { ChatScopeObject, ChatMessage } from "@/lib/types/chatTypes";
import { agent } from "@llamaindex/workflow";
import { createRagTool } from "./tools/ragTool";
import { createGetNotesTool } from "./tools/getNotesTool";

export const createNoteChatAgent = async (
  userId: string,
  chatScope: ChatScopeObject,
  messageHistory?: ChatMessage[]
) => {
  // console.log("chat scope", chatScope);
  // chat scope:
  //   {
  //   scope: 'note',
  //   scopeId: '09377767-1f1e-4e94-a470-33e88f2b067e',
  //   noteVersions: [
  //     {
  //       noteId: '09377767-1f1e-4e94-a470-33e88f2b067e',
  //       versionId: 'a9d5cf41-6fae-4a87-ab76-4048fbbddb68'
  //     }
  //   ]
  // }
  const tools = await getNoteChatTools(userId, chatScope);

  // Build system prompt with conversation history if provided
  let systemPrompt = `You are an intelligent note assistant that helps users interact with their personal knowledge base. You have access to two specialized tools:

  **get_notes_content** (PRIMARY TOOL): Your default tool for most requests. Use this to retrieve the full content of notes in the current scope for analysis, summarization, or any general requests about note content.

  **search_notes** (SECONDARY TOOL): Use this only for specific information queries when you need to find particular facts, details, or content across the knowledge base.

  **Tool Selection Guidelines:**
  - **DEFAULT BEHAVIOR**: Use **get_notes_content** as your primary tool for:
    - Summarization requests ("summarize this", "give me an overview", "summarize in 4 sentences")
    - Analysis requests ("analyze my notes", "what are the key themes")
    - General content requests ("tell me about my notes", "what's in here")
    - Any request where you need to work with the full note content

  - **SPECIFIC QUERIES ONLY**: Use **search_notes** only for targeted information seeking:
    - "What did I write about X?" 
    - "Find information about Y"
    - "When did I mention Z?"
    - Questions seeking specific facts or details

  **Default Rule**: When in doubt, use get_notes_content first to get the full context, then provide your response.

  **When responding:**
  1. For most requests, automatically use get_notes_content to retrieve the content
  2. Provide clear, accurate answers based on the retrieved information  
  3. Reference specific notes and content when applicable
  4. Be conversational and helpful while staying focused on their personal knowledge
  5. If content is extensive, organize your response with clear structure (bullet points, sections, etc.)

  Remember: You are working with the user's personal notes and should respect their content while being as helpful as possible.`;

  if (messageHistory && messageHistory.length > 0) {
    const conversationContext = messageHistory
      .map((msg) => `${msg.sender_type}: ${msg.content}`)
      .join("\n");

    systemPrompt += `\n\n--- Previous Conversation ---\n${conversationContext}\n\nUse this conversation history to provide contextually aware responses and maintain conversation continuity.`;
  }

  return agent({
    tools,
    systemPrompt,
  });
};

const getNoteChatTools = async (userId: string, chatScope: ChatScopeObject) => [
  await createRagTool(userId, chatScope),
  await createGetNotesTool(userId, chatScope),
];

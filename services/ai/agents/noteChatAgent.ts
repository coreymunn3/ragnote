import { ChatScopeObject } from "@/lib/types/chatTypes";
import { openai } from "@llamaindex/openai";
import { agent } from "@llamaindex/workflow";
import { createRagTool } from "./tools/ragTool";

export const createNoteChatAgent = async (
  userId: string,
  scope: ChatScopeObject
) => {
  const tools = await getNoteChatTools(userId, scope);
  return agent({
    tools,
    llm: openai({ model: "gpt-4o-mini" }),
  });
};

const getNoteChatTools = async (userId: string, scope: ChatScopeObject) => [
  await createRagTool(userId, scope),
  // summaryTool(userId, scope) // TO DO
];

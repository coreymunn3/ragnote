import { ChatScopeObject } from "@/lib/types/chatTypes";
import { createNoteChatAgent } from "./noteChatAgent";

export const createAgent = (
  agentType: "noteChat" | "folderChat" | "globalChat",
  userId: string,
  scope: ChatScopeObject
) => {
  switch (agentType) {
    case "noteChat":
      return createNoteChatAgent(userId, scope);
    default:
      throw new Error(`Unknown agent type: ${agentType}`);
  }
};

import { withErrorHandling } from "@/lib/errors/errorHandlers";
import { prisma } from "@/lib/prisma";

export class ChatService {
  public createChatSession = withErrorHandling(async (params) => {
    // TO DO - create a chat session for the user given a scope
  });

  public createChatMessage = withErrorHandling(async (params) => {
    // TO DO - create a chat message given a session
  });
}

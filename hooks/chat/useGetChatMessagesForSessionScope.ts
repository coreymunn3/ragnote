import { ChatMessage, ChatScope } from "@/lib/types/chatTypes";
import { UseQueryHookOptions } from "@/lib/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const getChatMessagesForSessionScope = async (
  sessionId: string,
  scope: ChatScope,
  scopeId?: string
) => {
  switch (scope) {
    case "note":
      const noteRes = await axios.get(`/api/note/${scopeId}/chat/${sessionId}`);
      return noteRes.data;
    // TO DO
    // case 'folder':
    //
    // case 'global':
    //
    default:
      throw new Error(`Invalid scope: ${scope}`);
  }
};

export type UseGetChatMessagesForSessionScopeOptions = UseQueryHookOptions<
  ChatMessage[]
>;

export function useGetChatMessagesForSessionScope(
  sessionId: string,
  scope: ChatScope,
  scopeId?: string,
  options?: UseGetChatMessagesForSessionScopeOptions
) {
  return useQuery<ChatMessage[]>({
    queryKey: ["chatConversation", sessionId, scope, scopeId],
    queryFn: () => getChatMessagesForSessionScope(sessionId, scope, scopeId),
    ...options,
  });
}

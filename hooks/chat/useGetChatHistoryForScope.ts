import { ChatScope, ChatSession } from "@/lib/types/chatTypes";
import { UseQueryHookOptions } from "@/lib/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const getChatHistoryForScope = async (scope: ChatScope, scopeId?: string) => {
  switch (scope) {
    case "note":
      const noteRes = await axios.get(`/api/note/${scopeId}/chat/history`);
      return noteRes.data;
    // TO DO
    // case 'folder':
    //   const folderRes = await axios.get(`/api/folder/${scopeId}/chat/history`);
    //   return folderRes.data;
    // case 'global':
    //   const globalRes = await axios.get(`/api/global/chat/history`);
    //   return globalRes.data;
    default:
      throw new Error(`Invalid scope: ${scope}`);
  }
};

export type UseGetChatHistoryForScopeOptions = UseQueryHookOptions<
  ChatSession[]
>;

export function useGetChatHistoryForScope(
  scope: ChatScope,
  scopeId?: string,
  options?: UseGetChatHistoryForScopeOptions
) {
  return useQuery<ChatSession[]>({
    queryKey: ["chatHistory", scope, scopeId],
    queryFn: () => getChatHistoryForScope(scope, scopeId),
    ...options,
  });
}

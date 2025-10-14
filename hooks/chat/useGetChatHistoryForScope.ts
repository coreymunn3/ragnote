import { ChatScope, ChatSession } from "@/lib/types/chatTypes";
import { UseQueryHookOptions } from "@/lib/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const getChatHistoryForScope = async (scope: ChatScope, scopeId?: string) => {
  // Build query params
  const params = new URLSearchParams({ scope });
  if (scopeId) {
    params.append("scopeId", scopeId);
  }

  const res = await axios.get(`/api/chat/history?${params.toString()}`);
  return res.data;
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

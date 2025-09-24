import { UseQueryHookOptions } from "@/lib/types/sharedTypes";
import { ChatMessage } from "@/lib/types/chatTypes";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getChatMessagesForSession(sessionId: string) {
  const res = await axios.get(`/api/chat/${sessionId}/message`);
  return res.data;
}

export type UserGetChatMessagesForSessionOption = UseQueryHookOptions<
  ChatMessage[]
>;

export function useGetChatMessagesForSession(
  sessionId: string,
  options?: UserGetChatMessagesForSessionOption
) {
  return useQuery<ChatMessage[]>({
    queryKey: ["chat-session", sessionId, "messages"],
    queryFn: () => getChatMessagesForSession(sessionId),
    ...options,
  });
}

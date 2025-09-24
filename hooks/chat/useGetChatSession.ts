import { ChatSession } from "@/lib/types/chatTypes";
import { UseQueryHookOptions } from "@/lib/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getChatSession(sessionId: string): Promise<ChatSession> {
  const res = await axios.get(`/api/chat/${sessionId}`);
  return res.data;
}

export type UseGetChatSessionOptions = UseQueryHookOptions<ChatSession>;

export function useGetChatSession(
  sessionId: string,
  options?: UseGetChatSessionOptions
) {
  return useQuery<ChatSession>({
    queryKey: ["chat-session", sessionId],
    queryFn: () => getChatSession(sessionId),
    ...options,
  });
}

import { useQuery } from "@tanstack/react-query";
import { UseQueryHookOptions } from "@/lib/types/sharedTypes";
import axios from "axios";
import { ChatSession } from "@/lib/types/chatTypes";

const getChatSessionsForUser = async () => {
  const res = await axios.get("/api/chat");
  return res.data;
};

export type UseGetChatSessionsForUserOptions = UseQueryHookOptions<
  ChatSession[]
>;

export function useGetChatSessionsForUser(
  options?: UseGetChatSessionsForUserOptions
) {
  return useQuery<ChatSession[]>({
    queryKey: ["user-chat-sessions"],
    queryFn: getChatSessionsForUser,
    ...options,
  });
}

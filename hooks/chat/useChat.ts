import { UseMutationHookOptions } from "@/lib/types/sharedTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleClientSideMutationError } from "@/lib/errors/handleClientSideMutationError";
import axios from "axios";
import { toast } from "sonner";
import { ChatScope, SendChatResponse } from "@/lib/types/chatTypes";

interface ChatArgs {
  message: string;
  scope: ChatScope;
  scopeId?: string;
  sessionId?: string;
}

async function sendChat({
  message,
  scope,
  scopeId,
  sessionId,
}: ChatArgs): Promise<SendChatResponse> {
  const res = await axios.post(`/api/chat`, {
    message,
    scope,
    scopeId,
    sessionId,
  });
  return res.data;
}

export type UseChatOptions = UseMutationHookOptions<
  SendChatResponse,
  Error,
  ChatArgs
>;

/**
 * Hook for sending chat messages to any scope (note, folder, global)
 */
export function useChat(options?: UseChatOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: sendChat,
    onError: (error, variables, context) => {
      toast.error("Failed to send chat");
      handleClientSideMutationError(
        error,
        `Failed to send chat with scope ${variables.scope}`
      );
      // custom onError callback
      options?.onError?.(error, variables, context);
    },
  });
}

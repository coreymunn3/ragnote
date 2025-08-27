import { UseMutationHookOptions } from "@/lib/types/sharedTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleClientSideMutationError } from "@/lib/errors/handleClientSideMutationError";
import axios from "axios";
import { toast } from "sonner";
import { SendChatResponse } from "@/lib/types/chatTypes";

interface chatWithNoteArg {
  noteId: string;
  message: string;
  sessionId?: string;
}

async function chatWithNote({
  noteId,
  message,
  sessionId,
}: chatWithNoteArg): Promise<SendChatResponse> {
  const res = await axios.post(`/api/note/${noteId}/chat`, {
    message,
    sessionId,
  });
  return res.data;
}

export type chatWithNoteOptions = UseMutationHookOptions<
  SendChatResponse,
  Error,
  chatWithNoteArg
>;

export function useChatWithNote(options?: chatWithNoteOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: chatWithNote,
    onError: (error, variables, context) => {
      toast.error("Failed to send chat");
      handleClientSideMutationError(
        error,
        `Failed to send chat with note ${variables.noteId}`
      );
      // custom onError callback
      options?.onError?.(error, variables, context);
    },
  });
}

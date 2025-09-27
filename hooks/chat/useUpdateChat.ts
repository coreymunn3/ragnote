import { handleClientSideMutationError } from "@/lib/errors/handleClientSideMutationError";
import { ChatSession, UpdateChatApiRequest } from "@/lib/types/chatTypes";
import { PrismaNote, UpdateNoteApiRequest } from "@/lib/types/noteTypes";
import { UseMutationHookOptions } from "@/lib/types/sharedTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

type DeleteResponse = { success: boolean };
type UndateChatResponse = PrismaNote | DeleteResponse;

interface UpdateChatArg extends UpdateChatApiRequest {
  sessionId: string;
}

async function updateChat({
  sessionId,
  action,
  title,
}: UpdateChatArg): Promise<UndateChatResponse> {
  const res = await axios.put(`/api/chat/${sessionId}`, {
    action,
    title,
  });
  return res.data;
}

export type useUpdateChatOptions = UseMutationHookOptions<
  UndateChatResponse,
  Error,
  UpdateChatArg
>;

export function useUpdateChat(options?: useUpdateChatOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateChat,
    onMutate: async (variables) => {
      // optimistic update for title change
      if (variables.action === "update_title" && variables.title) {
        // cancel outgoing queries
        await queryClient.cancelQueries({
          queryKey: ["chat-session", variables.sessionId],
        });
        // snapshot prev value
        const previousSession = queryClient.getQueryData([
          "chat-session",
          variables.sessionId,
        ]);
        // optimistically update chat session title
        queryClient.setQueryData(
          ["chat-session", variables.sessionId],
          (old: any) => {
            if (!old) return old;
            return {
              ...old,
              title: variables.title,
            };
          }
        );
        // return the previous session
        return { previousSession };
      }
      // Call custom onMutate if provided
      return options?.onMutate?.(variables);
    },
    onSuccess: (response, variables, context) => {
      switch (variables.action) {
        case "update_title":
          // for title update invalidate the chat session query
          queryClient.invalidateQueries({
            queryKey: ["chat-session", variables.sessionId],
          });
          // also invalidate the system folder query (chat folder is system folder)
          queryClient.invalidateQueries({
            queryKey: ["folders"],
          });
          queryClient.invalidateQueries({
            queryKey: ["folder", "system_chats"],
          });
          break;
        case "delete":
          // invalidate the system folder and its contents
          queryClient.invalidateQueries({
            queryKey: ["folders"],
          });
          queryClient.invalidateQueries({
            queryKey: ["folder", "system_chats"],
          });
          break;
        default:
          queryClient.invalidateQueries({
            queryKey: ["folders"],
          });
          break;
      }
    },
  });
}

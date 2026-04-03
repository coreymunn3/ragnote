import { handleClientSideMutationError } from "@/lib/errors/handleClientSideMutationError";
import { PrismaNote, UpdateNoteApiRequest } from "@/lib/types/noteTypes";
import { UseMutationHookOptions } from "@/lib/types/sharedTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

// Response type for delete action
type DeleteResponse = { success: boolean };

// Union type for all possible response types
type UpdateNoteResponse = PrismaNote | DeleteResponse;

interface UpdateNoteArg extends UpdateNoteApiRequest {
  noteId: string;
}

async function updateNote({
  noteId,
  action,
  folderId,
}: UpdateNoteArg): Promise<UpdateNoteResponse> {
  const res = await axios.put(`/api/note/${noteId}`, {
    action,
    folderId,
  });
  return res.data;
}

export type useUpdateNoteOptions = UseMutationHookOptions<
  UpdateNoteResponse,
  Error,
  UpdateNoteArg
>;

export function useUpdateNote(options?: useUpdateNoteOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateNote,
    onSuccess: (response, variables, context) => {
      // Handle cache invalidation based on action type
      switch (variables.action) {
        case "toggle_pin":
          // For pin/unpin, invalidate notes, folders and specific folder if known
          queryClient.invalidateQueries({
            queryKey: ["folders"],
          });
          queryClient.invalidateQueries({
            queryKey: ["notes"],
          });
          if (variables.folderId) {
            queryClient.invalidateQueries({
              queryKey: ["folder", variables.folderId],
            });
          }
          break;

        case "move":
          // For move, invalidate all folder queries since we don't know source folder
          queryClient.invalidateQueries({
            queryKey: ["folders"],
          });
          queryClient.invalidateQueries({
            queryKey: ["folder"],
          });
          break;

        case "delete":
          // invalidate the deleted-items
          queryClient.invalidateQueries({
            queryKey: ["deleted-items"],
            refetchType: "active",
          });
          // invalidate notes
          queryClient.invalidateQueries({
            queryKey: ["notes"],
          });
          queryClient.invalidateQueries({
            queryKey: ["note", variables.noteId],
          });
          // invalidate folders
          queryClient.invalidateQueries({
            queryKey: ["folders"],
          });
          if (variables.folderId) {
            queryClient.invalidateQueries({
              queryKey: ["folder", variables.folderId],
            });
          }
          break;

        case "recover":
          // invalidate the deleted-items
          queryClient.invalidateQueries({
            queryKey: ["deleted-items"],
            refetchType: "active",
          });
          // invalidate notes
          queryClient.invalidateQueries({
            queryKey: ["notes"],
          });
          queryClient.invalidateQueries({
            queryKey: ["note", variables.noteId],
          });
          // invalidate folders
          queryClient.invalidateQueries({
            queryKey: ["folders"],
          });
          if (variables.folderId) {
            queryClient.invalidateQueries({
              queryKey: ["folder", variables.folderId],
            });
          }
          break;

        default:
          // Fallback: invalidate folders and notes
          queryClient.invalidateQueries({
            queryKey: ["folders"],
          });
          queryClient.invalidateQueries({
            queryKey: ["notes"],
          });
          break;
      }

      // Show appropriate success message based on action
      const actionMessages = {
        toggle_pin:
          variables.action === "toggle_pin" && "is_pinned" in response
            ? response.is_pinned
              ? "Note pinned"
              : "Note unpinned"
            : "Note updated",
        move: "Note moved successfully",
        delete: "Note deleted",
        recover: "Note recovered from trash",
      };

      toast.success(actionMessages[variables.action] || "Note updated");

      // Custom onSuccess callback
      options?.onSuccess?.(response, variables, context);
    },
    onError: (error, variables, context) => {
      handleClientSideMutationError(error, "Failed to update note");
      // Custom onError callback
      options?.onError?.(error, variables, context);
    },
  });
}

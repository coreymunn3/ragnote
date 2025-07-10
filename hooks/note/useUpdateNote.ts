import { handleClientSideApiError } from "@/lib/errors/handleClientSideApiError";
import { PrismaNote, UpdateNoteApiRequest } from "@/lib/types/noteTypes";
import { UseMutationHookOptions } from "@/lib/types/sharedTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

interface UpdateNoteArg extends UpdateNoteApiRequest {
  noteId: string;
}

async function updateNote({
  noteId,
  action,
  folderId,
}: UpdateNoteArg): Promise<PrismaNote> {
  const res = await axios.put(`/api/note/${noteId}`, {
    action,
    folderId,
  });
  return res.data;
}

export type useUpdateNoteOptions = UseMutationHookOptions<
  PrismaNote,
  Error,
  UpdateNoteArg
>;

export function useUpdateNote(options?: useUpdateNoteOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateNote,
    onSuccess: (updatedNote, variables, context) => {
      // Invalidate folder queries to update the UI
      queryClient.invalidateQueries({
        queryKey: ["folders"],
      });

      // For move action, invalidate all folder queries to ensure UI updates
      if (variables.action === "move") {
        // Invalidate all folder queries since we don't know the source folder ID
        queryClient.invalidateQueries({
          queryKey: ["folder"],
        });
      } else {
        // For other actions (pin/delete), invalidate the specific folder
        if (variables?.folderId) {
          queryClient.invalidateQueries({
            queryKey: ["folder", variables.folderId],
          });
        }
      }

      // Show appropriate success message based on action
      const actionMessages = {
        toggle_pin: updatedNote.is_pinned ? "Note pinned" : "Note unpinned",
        move: "Note moved successfully",
        delete: "Note deleted",
      };

      toast.success(actionMessages[variables.action] || "Note updated");

      // Custom onSuccess callback
      options?.onSuccess?.(updatedNote, variables, context);
    },
    onError: (error, variables, context) => {
      handleClientSideApiError(error, "Failed to update note");
      // Custom onError callback
      options?.onError?.(error, variables, context);
    },
  });
}

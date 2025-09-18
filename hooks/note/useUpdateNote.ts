import { handleClientSideMutationError } from "@/lib/errors/handleClientSideMutationError";
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
  title,
}: UpdateNoteArg): Promise<PrismaNote> {
  const res = await axios.put(`/api/note/${noteId}`, {
    action,
    folderId,
    title,
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
    onMutate: async (variables) => {
      // Optimistic update for title changes
      if (variables.action === "update_title" && variables.title) {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey: ["note", variables.noteId],
        });

        // Snapshot the previous value
        const previousNote = queryClient.getQueryData([
          "note",
          variables.noteId,
        ]);

        // Optimistically update the note title
        queryClient.setQueryData(["note", variables.noteId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            title: variables.title,
          };
        });

        // Return a context object with the snapshotted value
        return { previousNote };
      }

      // Call custom onMutate if provided
      return options?.onMutate?.(variables);
    },
    onSuccess: (updatedNote, variables, context) => {
      // Handle cache invalidation based on action type
      switch (variables.action) {
        case "update_title":
          // For title updates, invalidate the specific note query
          queryClient.invalidateQueries({
            queryKey: ["note", variables.noteId],
          });
          // Also invalidate folders to update note titles in lists
          queryClient.invalidateQueries({
            queryKey: ["folders"],
          });
          break;

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
          // For delete, invalidate notes, folders and specific folder if known
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
        toggle_pin: updatedNote.is_pinned ? "Note pinned" : "Note unpinned",
        move: "Note moved successfully",
        delete: "Note deleted",
        update_title: "Note title updated",
      };

      toast.success(actionMessages[variables.action] || "Note updated");

      // Custom onSuccess callback
      options?.onSuccess?.(updatedNote, variables, context);
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update for title changes
      if (
        variables.action === "update_title" &&
        context &&
        typeof context === "object" &&
        "previousNote" in context
      ) {
        queryClient.setQueryData(
          ["note", variables.noteId],
          (context as { previousNote: any }).previousNote
        );
      }

      handleClientSideMutationError(error, "Failed to update note");
      // Custom onError callback
      options?.onError?.(error, variables, context);
    },
  });
}

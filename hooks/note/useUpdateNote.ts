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
      queryClient.invalidateQueries({
        queryKey: ["folder", variables.folderId],
      });
      toast.success(`Note has been updated`);
      // Custom onSuccess callback
      options?.onSuccess?.(updatedNote, variables, context);
    },
    onError: (error, variables, context) => {
      handleClientSideApiError(error, "Failed to pin/unpin note");
      // Custom onError callback
      options?.onError?.(error, variables, context);
    },
  });
}

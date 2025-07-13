import { handleClientSideApiError } from "@/lib/errors/handleClientSideApiError";
import {
  PrismaNoteVersion,
  UpdateNoteVersionContentApiRequest,
} from "@/lib/types/noteTypes";
import { UseMutationHookOptions } from "@/lib/types/sharedTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

interface SaveNoteVersionContentArg extends UpdateNoteVersionContentApiRequest {
  noteId: string;
  versionId: string;
}

async function saveNoteVersionContent({
  versionId,
  noteId,
  richTextContent,
}: SaveNoteVersionContentArg): Promise<PrismaNoteVersion> {
  const res = await axios.put(`/api/note/${noteId}/version/${versionId}`, {
    richTextContent,
  });
  return res.data;
}

export type useSaveNoteVersionOptions = UseMutationHookOptions<
  PrismaNoteVersion,
  Error,
  SaveNoteVersionContentArg
>;

export function useSaveNoteVersionContent(options?: useSaveNoteVersionOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: saveNoteVersionContent,
    onSuccess: (updatedNote, variables, context) => {
      // invalidate the note version query for this version if it exists
      queryClient.invalidateQueries({
        queryKey: ["noteVersion", variables.noteId, variables.versionId],
      });
      // Custom onSuccess callback
      options?.onSuccess?.(updatedNote, variables, context);
    },
    onError: (error, variables, context) => {
      handleClientSideApiError(error, "Failed to save note");
      // Custom onError callback
      options?.onError?.(error, variables, context);
    },
  });
}

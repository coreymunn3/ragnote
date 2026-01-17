import {
  PrismaNoteVersion,
  UpdateNoteVersionContentApiRequest,
} from "@/lib/types/noteTypes";
import { UseMutationHookOptions } from "@/lib/types/sharedTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleClientSideMutationError } from "@/lib/errors/handleClientSideMutationError";
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
      // invalidate the single note version query for this specific version
      // Note: This query is currently not being used/called anywhere!
      queryClient.invalidateQueries({
        queryKey: ["noteVersion", variables.noteId, variables.versionId],
      });
      // invalidate the note versions list query to update the selectedVersion in the toolbar
      queryClient.invalidateQueries({
        queryKey: ["noteVersions", variables.noteId],
      });
      // invalidate the note query since the title may have been changed
      queryClient.invalidateQueries({
        queryKey: ["note", variables.noteId],
      });
      // Custom onSuccess callback
      options?.onSuccess?.(updatedNote, variables, context);
    },
    onError: (error, variables, context) => {
      handleClientSideMutationError(error, "Failed to save note");
      // Custom onError callback
      options?.onError?.(error, variables, context);
    },
  });
}

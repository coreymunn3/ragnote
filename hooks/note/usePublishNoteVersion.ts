import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleClientSideMutationError } from "@/lib/errors/handleClientSideMutationError";
import { UseMutationHookOptions } from "@/lib/types/sharedTypes";
import axios from "axios";
import { toast } from "sonner";
import { PublishNoteResponse } from "@/lib/types/noteTypes";

interface PublishNoteVersionArg {
  noteId: string;
  versionId: string;
}

async function publishNoteVersion({
  noteId,
  versionId,
}: PublishNoteVersionArg): Promise<PublishNoteResponse> {
  const res = await axios.post(
    `/api/note/${noteId}/version/${versionId}/publish`
  );
  return res.data;
}

export type usePublishNoteVersionOptions = UseMutationHookOptions<
  PublishNoteResponse,
  Error,
  PublishNoteVersionArg
>;

export function usePublishNoteVersion(options?: usePublishNoteVersionOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: publishNoteVersion,
    onSuccess: (updatedNote, variables, context) => {
      toast.success("Version has been Published");
      // invalidate the versions query - we will have one more version now, and a previous version will now be published
      queryClient.invalidateQueries({
        queryKey: ["noteVersions", variables.noteId],
      });
      // invalidate the note query as well, since the current version will have changed.
      queryClient.invalidateQueries({
        queryKey: ["note", variables.noteId],
      });
      // Custom onSuccess callback
      options?.onSuccess?.(updatedNote, variables, context);
    },
    onError: (error, variables, context) => {
      // handle the error
      handleClientSideMutationError(error, "Failed to publish note");
      // Custom onError callback
      options?.onError?.(error, variables, context);
    },
  });
}

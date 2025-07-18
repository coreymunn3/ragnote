import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleClientSideApiError } from "@/lib/errors/handleClientSideApiError";
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
      // Show a generic message to the user
      toast.error("Failed to publish note version. Please try again later.");

      // Custom onError callback
      options?.onError?.(error, variables, context);
    },
  });
}

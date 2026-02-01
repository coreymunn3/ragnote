import {
  UpdateNoteVersionContentApiRequest,
  UpdateNoteVersionContentResponse,
} from "@/lib/types/noteTypes";
import { UseMutationHookOptions } from "@/lib/types/sharedTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleClientSideMutationError } from "@/lib/errors/handleClientSideMutationError";
import axios from "axios";
import { FolderWithItems } from "@/lib/types/folderTypes";

interface SaveNoteVersionContentArg extends UpdateNoteVersionContentApiRequest {
  noteId: string;
  versionId: string;
}

async function saveNoteVersionContent({
  versionId,
  noteId,
  richTextContent,
}: SaveNoteVersionContentArg): Promise<UpdateNoteVersionContentResponse> {
  const res = await axios.put(`/api/note/${noteId}/version/${versionId}`, {
    richTextContent,
  });
  return res.data;
}

export type useSaveNoteVersionOptions = UseMutationHookOptions<
  UpdateNoteVersionContentResponse,
  Error,
  SaveNoteVersionContentArg
>;

export function useSaveNoteVersionContent(options?: useSaveNoteVersionOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: saveNoteVersionContent,
    onSuccess: (result, variables, context) => {
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

      // Optimistically update the folders cache with the new title from the API response
      // This avoids refetching all folders just to update one note's title in the sidebar
      const foldersData = queryClient.getQueryData<FolderWithItems[]>([
        "folders",
      ]);

      if (foldersData) {
        const updatedFolders = foldersData.map((folder) => ({
          ...folder,
          items: folder.items.map((item) => {
            // Check if this is the note we just updated
            if ("title" in item && item.id === variables.noteId) {
              return {
                ...item,
                title: result.note.title,
              };
            }
            return item;
          }),
        }));

        queryClient.setQueryData(["folders"], updatedFolders);
      }

      // Custom onSuccess callback
      options?.onSuccess?.(result, variables, context);
    },
    onError: (error, variables, context) => {
      handleClientSideMutationError(error, "Failed to save note");
      // Custom onError callback
      options?.onError?.(error, variables, context);
    },
  });
}

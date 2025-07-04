import { PrismaFolder } from "@/lib/types/folderTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UseMutationHookOptions } from "@/lib/types/sharedTypes";
import axios from "axios";
import { toast } from "sonner";
import { handleClientSideApiError } from "@/lib/errors/handleClientSideApiError";

async function deleteFolder(data: { folderId: string }): Promise<PrismaFolder> {
  const res = await axios.delete<PrismaFolder>(`/api/folder/${data.folderId}`);
  return res.data;
}

export type UseDeleteFolderOptions = UseMutationHookOptions<
  PrismaFolder,
  Error,
  { folderId: string }
>;

export function useDeleteFolder(options?: UseDeleteFolderOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteFolder,
    onSuccess: (deletedFolder, variables, context) => {
      // Invalidate the list of folders
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast.success(`${deletedFolder.folder_name} has been deleted`);

      // Custom onSuccess callback
      options?.onSuccess?.(deletedFolder, variables, context);
    },
    onError: (error, variables, context) => {
      handleClientSideApiError(error);
      // Custom onError callback
      options?.onError?.(error, variables, context);
    },
  });
}

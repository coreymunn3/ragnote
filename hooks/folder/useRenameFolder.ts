import { PrismaFolder } from "@/lib/types/folderTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UseMutationHookOptions } from "@/lib/types/sharedTypes";
import axios from "axios";
import { toast } from "sonner";
import { handleClientSideMutationError } from "@/lib/errors/handleClientSideMutationError";

async function renameFolder(data: {
  folderId: string;
  newFolderName: string;
}): Promise<PrismaFolder> {
  const res = await axios.put<PrismaFolder>(`/api/folder/${data.folderId}`, {
    folderName: data.newFolderName,
  });
  return res.data;
}

export type UseRenameFolderOptions = UseMutationHookOptions<
  PrismaFolder,
  Error,
  { folderId: string; newFolderName: string }
>;

export function useRenameFolder(options?: UseRenameFolderOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: renameFolder,
    onSuccess: (updatedFolder, variables, context) => {
      // Default behavior
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({
        queryKey: ["folder", variables.folderId],
      });
      toast.success(
        `...and it shall hereby be known as ${updatedFolder.folder_name}`
      );

      // Custom onSuccess callback
      options?.onSuccess?.(updatedFolder, variables, context);
    },
    onError: (error, variables, context) => {
      handleClientSideMutationError(error, "Failed to rename folder");
      // Custom onError callback
      options?.onError?.(error, variables, context);
    },
  });
}

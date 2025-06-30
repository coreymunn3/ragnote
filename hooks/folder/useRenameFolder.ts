import { PrismaFolder } from "@/lib/types/folderTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UseMutationHookOptions } from "@/lib/types/sharedTypes";
import axios from "axios";
import { toast } from "sonner";

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
      // Default error handling
      toast.error("Failed to rename folder");
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        console.error("Failed to rename folder:", errorMessage);
      } else {
        console.error("Failed to rename folder:", error);
      }

      // Custom onError callback
      options?.onError?.(error, variables, context);
    },
  });
}

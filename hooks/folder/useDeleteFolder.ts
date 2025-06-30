import { PrismaFolder } from "@/lib/types/folderTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UseMutationHookOptions } from "@/lib/types/sharedTypes";
import axios from "axios";
import { toast } from "sonner";

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
    mutationFn: deleteFolder,
    onSuccess: (deletedFolder, variables, context) => {
      // Default behavior
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast.success(`${deletedFolder.folder_name} has been deleted`);

      // Custom onSuccess callback
      options?.onSuccess?.(deletedFolder, variables, context);
    },
    onError: (error, variables, context) => {
      // Default error handling
      toast.error("Failed to delete folder");
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        console.error("Failed to delete folder:", errorMessage);
      } else {
        console.error("Failed to delete folder:", error);
      }

      // Custom onError callback
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
}

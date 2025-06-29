import { PrismaFolder } from "@/lib/types/folderTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

async function deleteFolder(data: { folderId: string }): Promise<PrismaFolder> {
  const res = await axios.delete<PrismaFolder>(`/api/folder/${data.folderId}`);
  return res.data;
}

export function useDeleteFolder(
  onSuccess?: (updatedFolder: PrismaFolder) => void
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFolder,
    onSuccess: (deletedFolder) => {
      // Invalidate the folders list
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      // send toast
      toast.success(`${deletedFolder.folder_name} has been deleted`);
      // run the custom callback
      onSuccess?.(deletedFolder);
    },
    onError: (error) => {
      toast.error("Failed to delete folder");
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        console.error("Failed to delete folder:", errorMessage);
      } else {
        console.error("Failed to delete folder:", error);
      }
    },
  });
}

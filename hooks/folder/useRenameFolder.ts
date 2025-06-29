import { PrismaFolder } from "@/lib/types/folderTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

export function useRenameFolder(
  onSuccess?: (updatedFolder: PrismaFolder) => void
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: renameFolder,
    onSuccess: (updatedFolder) => {
      // Invalidate the folders list
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      // send toast
      toast.success(
        `...and it shall hereby be known as ${updatedFolder.folder_name}`
      );
      // run the custom callback
      onSuccess?.(updatedFolder);
    },
    onError: (error) => {
      toast.error("Failed to rename folder");
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        console.error("Failed to rename folder:", errorMessage);
      } else {
        console.error("Failed to rename folder:", error);
      }
    },
  });
}

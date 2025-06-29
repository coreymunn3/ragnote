import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CreateFolderApiRequest, PrismaFolder } from "@/lib/types/folderTypes";
import { toast } from "sonner";

async function createFolder(
  data: CreateFolderApiRequest
): Promise<PrismaFolder> {
  const response = await axios.post<PrismaFolder>("/api/folder", data);
  return response.data;
}

export function useCreateFolder(onSuccess?: (newFolder: PrismaFolder) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFolder,
    onSuccess: (newFolder) => {
      // Invalidate folders list to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      // send toast
      toast.success(`Folder "${newFolder.folder_name}" has been created!`);
      // Run custom callback if provided
      onSuccess?.(newFolder);
    },
    onError: (error) => {
      toast.error("Failed to create folder");
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        console.error("Failed to create folder:", errorMessage);
      } else {
        console.error("Failed to create folder:", error);
      }
    },
  });
}

// Future: Add other folder mutations here
// export function useUpdateFolder() { ... }
// export function useDeleteFolder() { ... }

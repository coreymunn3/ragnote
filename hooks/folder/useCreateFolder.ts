import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CreateFolderApiRequest, Folder } from "@/lib/types/folderTypes";

async function createFolder(data: CreateFolderApiRequest): Promise<Folder> {
  const response = await axios.post<Folder>("/api/folder", data);
  return response.data;
}

export function useCreateFolder(onSuccess?: (newFolder: Folder) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFolder,
    onSuccess: (newFolder) => {
      // Invalidate folders list to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["folders"] });

      console.log(`Folder "${newFolder.folder_name}" created successfully!`);

      // Run custom callback if provided
      onSuccess?.(newFolder);
    },
    onError: (error) => {
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

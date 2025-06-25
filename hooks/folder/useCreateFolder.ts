import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  CreateFolderApiRequest,
  FolderResponse,
} from "@/lib/types/folderTypes";

async function createFolder(
  data: CreateFolderApiRequest
): Promise<FolderResponse> {
  const response = await axios.post<FolderResponse>("/api/folder", data);
  return response.data;
}

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFolder,
    onSuccess: (newFolder) => {
      // Invalidate folders list to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["folders"] });

      console.log(`Folder "${newFolder.folder_name}" created successfully!`);
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

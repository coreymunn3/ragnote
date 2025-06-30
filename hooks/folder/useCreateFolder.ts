import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CreateFolderApiRequest, PrismaFolder } from "@/lib/types/folderTypes";
import { UseMutationHookOptions } from "@/lib/types/sharedTypes";
import { toast } from "sonner";

async function createFolder(
  data: CreateFolderApiRequest
): Promise<PrismaFolder> {
  const response = await axios.post<PrismaFolder>("/api/folder", data);
  return response.data;
}

export type UseCreateFolderOptions = UseMutationHookOptions<
  PrismaFolder,
  Error,
  CreateFolderApiRequest
>;

export function useCreateFolder(options?: UseCreateFolderOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFolder,
    onSuccess: (newFolder, variables, context) => {
      // Default behavior
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast.success(`${newFolder.folder_name} has been created!`);

      // Custom onSuccess callback
      options?.onSuccess?.(newFolder, variables, context);
    },
    onError: (error, variables, context) => {
      // Default error handling
      toast.error("Failed to create folder");
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        console.error("Failed to create folder:", errorMessage);
      } else {
        console.error("Failed to create folder:", error);
      }

      // Custom onError callback
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
}

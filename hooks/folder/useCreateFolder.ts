import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CreateFolderApiRequest, PrismaFolder } from "@/lib/types/folderTypes";
import { UseMutationHookOptions } from "@/lib/types/sharedTypes";
import { toast } from "sonner";
import { handleClientSideMutationError } from "@/lib/errors/handleClientSideMutationError";

async function createFolder(
  data: CreateFolderApiRequest
): Promise<PrismaFolder> {
  const res = await axios.post<PrismaFolder>("/api/folder", data);
  return res.data;
}

export type UseCreateFolderOptions = UseMutationHookOptions<
  PrismaFolder,
  Error,
  CreateFolderApiRequest
>;

export function useCreateFolder(options?: UseCreateFolderOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createFolder,
    onSuccess: (newFolder, variables, context) => {
      // Force invalidate and refetch the folders query
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      toast.success(`${newFolder.folder_name} has been created!`);

      // Custom onSuccess callback
      options?.onSuccess?.(newFolder, variables, context);
    },
    onError: (error, variables, context) => {
      handleClientSideMutationError(error, "Failed to create folder");
      // Custom onError callback
      options?.onError?.(error, variables, context);
    },
  });
}

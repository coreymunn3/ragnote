import { PrismaFolder, UpdateFolderApiRequest } from "@/lib/types/folderTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UseMutationHookOptions } from "@/lib/types/sharedTypes";
import axios from "axios";
import { toast } from "sonner";
import { handleClientSideMutationError } from "@/lib/errors/handleClientSideMutationError";

interface UpdateFolderArg extends UpdateFolderApiRequest {
  folderId: string;
}

async function updateFolder({
  folderId,
  action,
  folderName,
}: UpdateFolderArg): Promise<PrismaFolder | { success: boolean }> {
  const res = await axios.put(`/api/folder/${folderId}`, {
    action,
    folderName,
  });
  return res.data;
}

export type UseUpdateFolderOptions = UseMutationHookOptions<
  PrismaFolder | { success: boolean },
  Error,
  UpdateFolderArg
>;

export function useUpdateFolder(options?: UseUpdateFolderOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: updateFolder,
    onSuccess: (response, variables, context) => {
      switch (variables.action) {
        case "rename":
          // Invalidate the specific folder
          queryClient.invalidateQueries({
            queryKey: ["folder", variables.folderId],
          });
          // Invalidate the list of folders
          queryClient.invalidateQueries({ queryKey: ["folders"] });
          if ("folder_name" in response) {
            toast.success(`Folder renamed to "${response.folder_name}"`);
          }
          break;
        case "recover":
          // Invalidate the specific folder
          queryClient.invalidateQueries({
            queryKey: ["folder", variables.folderId],
          });
          // Invalidate the list of folders
          queryClient.invalidateQueries({ queryKey: ["folders"] });
          // Invalidate deleted items to remove the recovered folder
          queryClient.invalidateQueries({
            queryKey: ["deleted-items"],
          });
          toast.success("Folder recovered successfully");
          break;
        default:
          queryClient.invalidateQueries({ queryKey: ["folders"] });
          break;
      }
      // Custom onSuccess callback
      options?.onSuccess?.(response, variables, context);
    },
    onError: (error, variables, context) => {
      handleClientSideMutationError(error, "Failed to update folder");
      // Custom onError callback
      options?.onError?.(error, variables, context);
    },
  });
}

import { UseMutationHookOptions } from "@/lib/types/sharedTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleClientSideMutationError } from "@/lib/errors/handleClientSideMutationError";
import axios from "axios";
import { toast } from "sonner";

async function deleteFile(fileId: string): Promise<void> {
  await axios.delete(`/api/files/${fileId}`);
}

export type UseDeleteFileOptions = UseMutationHookOptions<void, Error, string>;

export function useDeleteFile(options?: UseDeleteFileOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: deleteFile,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["storage-usage"] });
      toast.success("File deleted");
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      handleClientSideMutationError(error, "Failed to delete file");
      options?.onError?.(error, variables, context);
    },
  });
}

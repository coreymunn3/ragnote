import { PrismaFile, UploadFileApiRequest } from "@/lib/types/fileTypes";
import { UseMutationHookOptions } from "@/lib/types/sharedTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleClientSideMutationError } from "@/lib/errors/handleClientSideMutationError";
import { toast } from "sonner";

async function uploadFile(data: UploadFileApiRequest): Promise<PrismaFile> {
  const formData = new FormData();
  formData.append("file", data.file);
  if (data.folderId) formData.append("folderId", data.folderId);

  const res = await fetch("/api/files/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Upload failed");
  }

  return res.json();
}

export type UseUploadFileOptions = UseMutationHookOptions<
  PrismaFile,
  Error,
  UploadFileApiRequest
>;

export function useUploadFile(options?: UseUploadFileOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: uploadFile,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["storage-usage"] });
      toast.success(`${data.file_name} uploaded successfully`);
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      handleClientSideMutationError(error, "Failed to upload file");
      options?.onError?.(error, variables, context);
    },
  });
}

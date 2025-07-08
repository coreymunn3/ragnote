import { handleClientSideApiError } from "@/lib/errors/handleClientSideApiError";
import { CreateNoteApiRequest, PrismaNote } from "@/lib/types/noteTypes";
import { UseMutationHookOptions } from "@/lib/types/sharedTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

async function createNote(data: CreateNoteApiRequest): Promise<PrismaNote> {
  const res = await axios.post("/api/note", data);
  return res.data;
}

export type UseCreateNoteOptions = UseMutationHookOptions<
  PrismaNote,
  Error,
  CreateNoteApiRequest
>;

export function useCreateNote(options?: UseCreateNoteOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    ...options,
    mutationFn: createNote,
    onSuccess: (data, variables, context) => {
      // refetch the folders since one of them will have a new note inside of it
      queryClient.invalidateQueries({ queryKey: ["folders"] });
      queryClient.invalidateQueries({
        queryKey: ["folder", variables.folderId],
      });
      toast.success(`New note has been created!`);
      // run the custom onSuccess cb if provided
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      handleClientSideApiError(error, "Failed to create note");
      // Custom onError callback
      options?.onError?.(error, variables, context);
    },
  });
}

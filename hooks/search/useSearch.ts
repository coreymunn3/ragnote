import { handleClientSideMutationError } from "@/lib/errors/handleClientSideMutationError";
import { SearchResultNote } from "@/lib/types/aiTypes";
import { UseMutationHookOptions } from "@/lib/types/sharedTypes";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const executeSearch = async (query: string): Promise<SearchResultNote[]> => {
  const res = await axios.get(`/api/search?query=${encodeURIComponent(query)}`);
  return res.data;
};

export type useSearchOptions = UseMutationHookOptions<
  SearchResultNote[],
  Error,
  string
>;

export function useSearch(options?: useSearchOptions) {
  return useMutation({
    ...options,
    mutationFn: executeSearch,
    onError: (error, variables, context) => {
      handleClientSideMutationError(error, "Failed to search");
      // custom onError callback
      options?.onError?.(error, variables, context);
    },
  });
}

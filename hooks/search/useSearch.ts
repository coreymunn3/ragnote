import { handleClientSideMutationError } from "@/lib/errors/handleClientSideMutationError";
import { SearchResult } from "@/lib/types/searchTypes";
import { UseMutationHookOptions } from "@/lib/types/sharedTypes";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const executeSearch = async (query: string): Promise<SearchResult> => {
  const res = await axios.get(`/api/search?query=${encodeURIComponent(query)}`);
  return res.data;
};

export type useSearchOptions = UseMutationHookOptions<
  SearchResult,
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

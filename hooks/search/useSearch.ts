import { handleClientSideMutationError } from "@/lib/errors/handleClientSideMutationError";
import { SearchMode, SearchResult } from "@/lib/types/searchTypes";
import { UseMutationHookOptions } from "@/lib/types/sharedTypes";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface SearchParams {
  query: string;
  searchMode: SearchMode;
}

const executeSearch = async ({
  query,
  searchMode,
}: SearchParams): Promise<SearchResult> => {
  const res = await axios.get(
    `/api/search?query=${encodeURIComponent(query)}&mode=${encodeURIComponent(searchMode)}`
  );
  return res.data;
};

export type useSearchOptions = UseMutationHookOptions<
  SearchResult,
  Error,
  SearchParams
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

import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const executeSearch = async (query: string): Promise<unknown> => {
  const res = await axios.get(`/api/search?query=${encodeURIComponent(query)}`);
  return res.data;
};

export function useSearch() {
  return useMutation({
    mutationFn: executeSearch,
  });
}

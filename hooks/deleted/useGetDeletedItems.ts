import { DeletedItemsCollection } from "@/lib/types/deletedTypes";
import { useQuery } from "@tanstack/react-query";
import { UseQueryHookOptions } from "@/lib/types/sharedTypes";
import axios from "axios";

const getDeletedItems = async (): Promise<DeletedItemsCollection> => {
  const res = await axios.get("/api/deleted");
  return res.data;
};

export type UseGetDeletedItemsOptions =
  UseQueryHookOptions<DeletedItemsCollection>;

export function useGetDeletedItems(options?: UseGetDeletedItemsOptions) {
  return useQuery<DeletedItemsCollection>({
    queryKey: ["deleted-items"],
    queryFn: getDeletedItems,
    ...options,
  });
}

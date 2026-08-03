import { StorageUsage } from "@/lib/types/fileTypes";
import { UseQueryHookOptions } from "@/lib/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const getStorageUsage = async (): Promise<StorageUsage> => {
  const res = await axios.get("/api/user/storage");
  return res.data;
};

export type UseGetStorageUsageOptions = UseQueryHookOptions<StorageUsage>;

export function useGetStorageUsage(options?: UseGetStorageUsageOptions) {
  return useQuery<StorageUsage>({
    queryKey: ["storage-usage"],
    queryFn: getStorageUsage,
    ...options,
  });
}

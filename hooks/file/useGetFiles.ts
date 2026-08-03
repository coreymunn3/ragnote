import { PrismaFile } from "@/lib/types/fileTypes";
import { UseQueryHookOptions } from "@/lib/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const getFiles = async (folderId?: string): Promise<PrismaFile[]> => {
  const url = folderId ? `/api/files?folderId=${folderId}` : "/api/files";
  const res = await axios.get(url);
  return res.data;
};

export type UseGetFilesOptions = UseQueryHookOptions<PrismaFile[]>;

export function useGetFiles(folderId?: string, options?: UseGetFilesOptions) {
  return useQuery<PrismaFile[]>({
    queryKey: ["files", folderId],
    queryFn: () => getFiles(folderId),
    ...options,
  });
}

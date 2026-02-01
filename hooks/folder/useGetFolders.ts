import { FolderWithItems } from "@/lib/types/folderTypes";
import { useQuery } from "@tanstack/react-query";
import { UseQueryHookOptions } from "@/lib/types/sharedTypes";
import axios from "axios";

const getFolders = async (): Promise<FolderWithItems[]> => {
  const res = await axios.get("/api/folder");
  return res.data;
};

export type UseGetFoldersOptions = UseQueryHookOptions<FolderWithItems[]>;

export function useGetFolders(options?: UseGetFoldersOptions) {
  return useQuery<FolderWithItems[]>({
    queryKey: ["folders"],
    queryFn: getFolders,
    ...options,
  });
}

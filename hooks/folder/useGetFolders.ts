import { FolderWithItems } from "@/lib/types/folderTypes";
import { useQuery } from "@tanstack/react-query";
import { Expand, UseQueryHookOptions } from "@/lib/types/sharedTypes";
import { UserAndSystemFolders } from "@/lib/types/folderTypes";
import axios from "axios";

const getFolders = async (): Promise<UserAndSystemFolders> => {
  const res = await axios.get("/api/folder");
  return res.data;
};

export type UseGetFoldersOptions = UseQueryHookOptions<UserAndSystemFolders>;

export function useGetFolders(options?: UseGetFoldersOptions) {
  return useQuery<UserAndSystemFolders>({
    queryKey: ["folders"],
    queryFn: getFolders,
    ...options,
  });
}

import { FolderWithNotes } from "@/lib/types/folderTypes";
import { useQuery } from "@tanstack/react-query";
import { Expand, UseQueryHookOptions } from "@/lib/types/sharedTypes";
import axios from "axios";

export type GetUserFoldersData = Expand<{
  user: FolderWithNotes[];
  system: FolderWithNotes[];
}>;

const getFolders = async (): Promise<GetUserFoldersData> => {
  const res = await axios.get("/api/folder");
  return res.data;
};

export type UseGetFoldersOptions = UseQueryHookOptions<GetUserFoldersData>;

export function useGetFolders(options?: UseGetFoldersOptions) {
  return useQuery<GetUserFoldersData>({
    queryKey: ["folders"],
    queryFn: getFolders,
    ...options,
  });
}

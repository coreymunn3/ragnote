import { useQuery, UseQueryResult } from "@tanstack/react-query";
import axios from "axios";
import { FolderWithItems } from "@/lib/types/folderTypes";
import { UseQueryHookOptions } from "@/lib/types/sharedTypes";

const getFolderById = async (folderId: string): Promise<FolderWithItems> => {
  const res = await axios.get(`/api/folder/${folderId}`);
  return res.data;
};

export type UseGetFolderByIdOptions = UseQueryHookOptions<FolderWithItems>;

export function useGetFolderById(
  folderId: string,
  options?: UseGetFolderByIdOptions
) {
  return useQuery<FolderWithItems>({
    queryKey: ["folder", folderId],
    queryFn: () => getFolderById(folderId),
    ...options,
  });
}

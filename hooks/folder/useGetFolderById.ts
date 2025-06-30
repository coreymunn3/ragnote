import { useQuery, UseQueryResult } from "@tanstack/react-query";
import axios from "axios";
import { FolderWithNotes } from "@/lib/types/folderTypes";
import { UseQueryHookOptions } from "@/lib/types/sharedTypes";

const getFolderById = async (folderId: string): Promise<FolderWithNotes> => {
  const res = await axios.get(`/api/folder/${folderId}`);
  return res.data;
};

export type UseGetFolderByIdOptions = UseQueryHookOptions<FolderWithNotes>;

export function useGetFolderById(
  folderId: string,
  options?: UseGetFolderByIdOptions
) {
  return useQuery<FolderWithNotes>({
    queryKey: ["folder", folderId],
    queryFn: () => getFolderById(folderId),
    ...options,
  });
}

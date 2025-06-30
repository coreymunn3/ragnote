import { FolderWithNotes } from "@/lib/types/folderTypes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
interface GetUserFoldersData {
  user: FolderWithNotes[];
  system: FolderWithNotes[];
}

const getFolders = async (): Promise<GetUserFoldersData> => {
  const res = await axios.get("/api/folder");
  return res.data;
};

export function useGetFolders() {
  return useQuery({
    queryKey: ["folders"],
    queryFn: getFolders,
  });
}

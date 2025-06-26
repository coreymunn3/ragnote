import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const getFolders = async () => {
  const res = await axios.get("/api/folder");
  return res.data;
};

export function useGetFolders() {
  return useQuery({
    queryKey: ["folders"],
    queryFn: getFolders,
  });
}

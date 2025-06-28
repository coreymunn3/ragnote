import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const getUserFolders = async () => {
  const res = await axios.get("/api/folder");
  return res.data;
};

export function useGetUserFolders() {
  return useQuery({
    queryKey: ["folders", "user"],
    queryFn: getUserFolders,
  });
}

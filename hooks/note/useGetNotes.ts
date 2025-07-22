import { Note } from "@/lib/types/noteTypes";
import { useQuery } from "@tanstack/react-query";
import { UseQueryHookOptions } from "@/lib/types/sharedTypes";
import axios from "axios";

const getNotes = async (): Promise<Note[]> => {
  const res = await axios.get("/api/note");
  return res.data;
};

export type UseGetNotesOptions = UseQueryHookOptions<Note[]>;

export function useGetNotes(options?: UseGetNotesOptions) {
  return useQuery<Note[]>({
    queryKey: ["notes"],
    queryFn: getNotes,
    ...options,
  });
}

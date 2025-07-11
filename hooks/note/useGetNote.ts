import { Note } from "@/lib/types/noteTypes";
import { UseQueryHookOptions } from "@/lib/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getNote(noteId: string): Promise<Note> {
  const res = await axios.get(`/api/note/${noteId}`);
  return res.data;
}

export type UseGetNoteOptions = UseQueryHookOptions<Note>;

export function useGetNote(noteId: string, options?: UseGetNoteOptions) {
  return useQuery<Note>({
    queryKey: ["note", noteId],
    queryFn: () => getNote(noteId),
    ...options,
  });
}

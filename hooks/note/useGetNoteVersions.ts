import { PrismaNoteVersion } from "@/lib/types/noteTypes";
import { UseQueryHookOptions } from "@/lib/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getNoteVersions(noteId: string): Promise<PrismaNoteVersion[]> {
  const res = await axios.get(`/api/note/${noteId}/version`);
  return res.data;
}

export type UseGetNoteVersionsOptions = UseQueryHookOptions<
  PrismaNoteVersion[]
>;

export function useGetNoteVersions(
  noteId: string,
  options?: UseGetNoteVersionsOptions
) {
  return useQuery<PrismaNoteVersion[]>({
    ...options,
    queryKey: ["noteVersions", noteId],
    queryFn: () => getNoteVersions(noteId),
  });
}

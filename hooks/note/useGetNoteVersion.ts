import { PrismaNoteVersion } from "@/lib/types/noteTypes";
import { UseQueryHookOptions } from "@/lib/types/sharedTypes";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

async function getNoteVersion(
  noteId: string,
  versionId: string
): Promise<PrismaNoteVersion> {
  const res = await axios.get(`/api/note/${noteId}/version/${versionId}`);
  return res.data;
}

export type UseGetNoteVersionOptions = UseQueryHookOptions<PrismaNoteVersion>;

export function useGetNoteVersion(
  noteId: string,
  versionId: string | null,
  options?: UseGetNoteVersionOptions
) {
  return useQuery<PrismaNoteVersion>({
    ...options,
    queryKey: ["noteVersion", noteId, versionId],
    queryFn: () => getNoteVersion(noteId, versionId!),
    enabled: !!noteId && !!versionId && options?.enabled !== false,
  });
}

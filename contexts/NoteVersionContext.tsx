"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { useParams } from "next/navigation";
import { Note, PrismaNoteVersion } from "@/lib/types/noteTypes";
import { useGetNote } from "@/hooks/note/useGetNote";
import { useGetNoteVersions } from "@/hooks/note/useGetNoteVersions";

interface NoteVersionContextType {
  selectedVersionId: string | null;
  setSelectedVersionId: (versionId: string) => void;
  selectedVersion: PrismaNoteVersion | null;
  noteVersions: PrismaNoteVersion[];
  note: Note | null;
  isLoading: boolean;
  error: Error | null;
}

const NoteVersionContext = createContext<NoteVersionContextType | undefined>(
  undefined
);

export function NoteVersionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { id: noteId }: { id: string } = useParams();
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    null
  );
  const [selectedVersion, setSelectedVersion] =
    useState<PrismaNoteVersion | null>(null);

  // Fetch the note data using the hook
  const {
    data: note,
    isLoading: noteLoading,
    error: noteError,
  } = useGetNote(noteId, {
    enabled: !!noteId, // Only fetch if noteId exists
  });

  // Fetch the note versions using the hook
  const {
    data: noteVersions,
    isLoading: versionsLoading,
    error: versionsError,
  } = useGetNoteVersions(noteId, {
    enabled: !!noteId, // Only fetch if noteId exists
  });

  // Set default selected version when note data is loaded
  useEffect(() => {
    if (note?.current_version?.id && !selectedVersionId) {
      setSelectedVersionId(note.current_version.id);
    }
  }, [note, selectedVersionId]);

  // Update selected version when selectedVersionId or noteVersions change
  useEffect(() => {
    if (selectedVersionId && noteVersions && noteVersions.length > 0) {
      const foundVersion = noteVersions.find((v) => v.id === selectedVersionId);
      setSelectedVersion(foundVersion || null);

      // If the selected version doesn't exist in the versions list,
      // fall back to the current version or the first available version
      if (!foundVersion) {
        const fallbackVersion = note?.current_version?.id
          ? noteVersions.find((v) => v.id === note.current_version.id)
          : noteVersions[0];

        if (fallbackVersion) {
          setSelectedVersionId(fallbackVersion.id);
          setSelectedVersion(fallbackVersion);
        }
      }
    } else {
      setSelectedVersion(null);
    }
  }, [selectedVersionId, noteVersions, note?.current_version?.id]);

  const contextValue: NoteVersionContextType = useMemo(
    () => ({
      selectedVersionId,
      setSelectedVersionId,
      selectedVersion,
      noteVersions: noteVersions || [],
      note: note || null,
      isLoading: noteLoading || versionsLoading,
      error: noteError || versionsError || null,
    }),
    [
      selectedVersionId,
      selectedVersion,
      noteVersions,
      note,
      noteLoading,
      versionsLoading,
      noteError,
      versionsError,
    ]
  );

  return (
    <NoteVersionContext.Provider value={contextValue}>
      {children}
    </NoteVersionContext.Provider>
  );
}

export function useNoteVersion() {
  const context = useContext(NoteVersionContext);
  if (context === undefined) {
    throw new Error("useNoteVersion must be used within a NoteVersionProvider");
  }
  return context;
}

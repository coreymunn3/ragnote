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

  useEffect(() => {
    if (selectedVersionId && noteVersions) {
      setSelectedVersion(
        noteVersions.find((v) => v.id === selectedVersionId) || null
      );
    } else {
      setSelectedVersion(null);
    }
  }, [selectedVersionId, noteVersions]);

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

  console.log("context", contextValue);

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

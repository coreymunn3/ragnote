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
import { useGetNoteVersion } from "@/hooks/note/useGetNoteVersion";

interface NoteVersionContextType {
  selectedVersionId: string | null;
  setSelectedVersionId: (versionId: string) => void;
  selectedVersion: PrismaNoteVersion | null;
  noteVersions: PrismaNoteVersion[];
  note: Note | null;
  loading: {
    noteLoading: boolean;
    versionsLoading: boolean;
  };
  error: {
    noteError: Error | null;
    versionsError: Error | null;
  };
}

const NoteVersionContext = createContext<NoteVersionContextType | undefined>(
  undefined
);

export function NoteVersionProvider({
  children,
  initialNote,
  initialNoteVersions,
}: {
  children: React.ReactNode;
  initialNote?: Note;
  initialNoteVersions?: PrismaNoteVersion[];
}) {
  const { id: noteId }: { id: string } = useParams();

  /**
   * The selected Version ID
   * Initialize with current version ID if we have initial note data
   */
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    initialNote?.current_version?.id || null
  );

  // Fetch the note data using the hook
  const {
    data: note,
    isLoading: noteLoading,
    error: noteError,
  } = useGetNote(noteId, {
    enabled: !!noteId, // Only fetch if noteId exists
    initialData: initialNote,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Fetch the note versions using the hook
  const {
    data: noteVersions,
    isLoading: versionsLoading,
    error: versionsError,
  } = useGetNoteVersions(noteId, {
    enabled: !!noteId, // Only fetch if noteId exists
    initialData: initialNoteVersions,
    staleTime: 0,
    refetchOnMount: true,
  });

  /**
   * The selected Version - full object
   * Initialize with the version matching the current version ID
   */
  const selectedVersion = useMemo(() => {
    if (selectedVersionId && noteVersions) {
      return noteVersions.find((v) => v.id === selectedVersionId) || null;
    }
    return null;
  }, [selectedVersionId, noteVersions]);

  const contextValue: NoteVersionContextType = useMemo(
    () => ({
      selectedVersionId,
      setSelectedVersionId,
      selectedVersion: selectedVersion || null,
      noteVersions: noteVersions || [],
      note: note || null,
      loading: {
        noteLoading,
        versionsLoading,
      },
      error: {
        noteError,
        versionsError,
      },
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

export function useNoteVersionContext() {
  const context = useContext(NoteVersionContext);
  if (context === undefined) {
    throw new Error("useNoteVersion must be used within a NoteVersionProvider");
  }
  return context;
}

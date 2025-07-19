"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { useParams, notFound } from "next/navigation";
import { Note, PrismaNoteVersion } from "@/lib/types/noteTypes";
import { useGetNote } from "@/hooks/note/useGetNote";
import { useGetNoteVersions } from "@/hooks/note/useGetNoteVersions";
import { useGetNoteVersion } from "@/hooks/note/useGetNoteVersion";
import { isNotFoundError } from "@/lib/errors/utils";

interface NoteVersionContextType {
  selectedVersionId: string | null;
  setSelectedVersionId: (versionId: string) => void;
  selectedVersion: PrismaNoteVersion | null;
  noteVersions: PrismaNoteVersion[];
  note: Note | null;
  isLoading: boolean;
  error: {
    noteError: Error | null;
    versionsError: Error | null;
    selectedVersionError: Error | null;
  };
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

  // Fetch the note data using the hook
  const {
    data: note,
    isLoading: noteLoading,
    error: noteError,
  } = useGetNote(noteId, {
    enabled: !!noteId, // Only fetch if noteId exists
  });

  // Check for 404 errors and redirect to not-found page
  useEffect(() => {
    if (!!noteError && isNotFoundError(noteError)) {
      notFound();
    }
    if (!!selectedVersionError && isNotFoundError(selectedVersionError)) {
      notFound();
    }
  }, [noteError]);

  // Fetch the note versions using the hook
  const {
    data: noteVersions,
    isLoading: versionsLoading,
    error: versionsError,
  } = useGetNoteVersions(noteId, {
    enabled: !!noteId, // Only fetch if noteId exists
  });

  // Fetch the selected note version data using the hook
  const {
    data: selectedVersion,
    isLoading: selectedVersionLoading,
    error: selectedVersionError,
  } = useGetNoteVersion(noteId, selectedVersionId);

  // Set default selected version when note data is loaded
  useEffect(() => {
    if (note?.current_version?.id && !selectedVersionId) {
      setSelectedVersionId(note.current_version.id);
    }
  }, [note, selectedVersionId]);

  // Fallback logic: if selected version fails to load and we have versions available,
  // fall back to current version or first available version
  useEffect(() => {
    if (
      selectedVersionId &&
      selectedVersionError &&
      noteVersions &&
      noteVersions.length > 0
    ) {
      const fallbackVersion = note?.current_version?.id
        ? noteVersions.find((v) => v.id === note.current_version.id)
        : noteVersions[0];
      // set the selected version to the fallback version above
      if (fallbackVersion && fallbackVersion.id !== selectedVersionId) {
        setSelectedVersionId(fallbackVersion.id);
      }
    }
  }, [
    selectedVersionId,
    selectedVersionError,
    noteVersions,
    note?.current_version?.id,
  ]);

  const contextValue: NoteVersionContextType = useMemo(
    () => ({
      selectedVersionId,
      setSelectedVersionId,
      selectedVersion: selectedVersion || null,
      noteVersions: noteVersions || [],
      note: note || null,
      isLoading: noteLoading || versionsLoading || selectedVersionLoading,
      error: {
        noteError,
        versionsError,
        selectedVersionError,
      },
    }),
    [
      selectedVersionId,
      selectedVersion,
      noteVersions,
      note,
      noteLoading,
      versionsLoading,
      selectedVersionLoading,
      noteError,
      versionsError,
      selectedVersionError,
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

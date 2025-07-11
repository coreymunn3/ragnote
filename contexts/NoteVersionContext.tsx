"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Note, PrismaNoteVersion } from "@/lib/types/noteTypes";
import { useGetNote } from "@/hooks/note/useGetNote";

interface NoteVersionContextType {
  selectedVersionId: string | null;
  setSelectedVersionId: (versionId: string) => void;
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
  const { id: noteId } = useParams();
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    null
  );

  // Fetch the note data using the hook
  const {
    data: note,
    isLoading,
    error,
  } = useGetNote(noteId as string, {
    enabled: !!noteId, // Only fetch if noteId exists
  });

  const noteVersions: PrismaNoteVersion[] = [
    {
      id: "abcd",
      note_id: noteId as string,
      version_number: 4,
      rich_text_content: {},
      plain_text_content: "Current version content...",
      is_published: true,
      published_at: new Date(),
      created_at: new Date(),
    },
    {
      id: "abc1",
      note_id: noteId as string,
      version_number: 3,
      rich_text_content: {},
      plain_text_content: "Version 3 content...",
      is_published: true,
      published_at: new Date(),
      created_at: new Date(),
    },
    {
      id: "abc2",
      note_id: noteId as string,
      version_number: 2,
      rich_text_content: {},
      plain_text_content: "Version 2 content...",
      is_published: true,
      published_at: new Date(),
      created_at: new Date(),
    },
    {
      id: "abc3",
      note_id: noteId as string,
      version_number: 1,
      rich_text_content: {},
      plain_text_content: "Version 1 content...",
      is_published: true,
      published_at: new Date(),
      created_at: new Date(),
    },
  ];

  // Set default selected version when note data is loaded
  useEffect(() => {
    if (note?.current_version?.id && !selectedVersionId) {
      setSelectedVersionId(note.current_version.id);
    }
  }, [note, selectedVersionId]);

  const contextValue: NoteVersionContextType = {
    selectedVersionId,
    setSelectedVersionId,
    noteVersions,
    note: note || null,
    isLoading,
    error: error || null,
  };

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

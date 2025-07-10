"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Note, PrismaNoteVersion } from "@/lib/types/noteTypes";

interface NoteVersionContextType {
  selectedVersionId: string | null;
  setSelectedVersionId: (versionId: string) => void;
  noteVersions: PrismaNoteVersion[];
  note: Note | null;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  // Placeholder data - will be replaced with actual API calls later
  const note: Note = {
    id: noteId as string,
    title: "Trips 2025",
    current_version: {
      id: "abcd",
      version_number: 4,
      is_published: true,
      published_at: new Date(),
    },
    is_pinned: false,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    shared_with_count: 2,
    preview: "Planning our trips for 2025...",
  };

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

  // Simulate loading and set default selected version
  useEffect(() => {
    const timer = setTimeout(() => {
      if (note?.current_version?.id && !selectedVersionId) {
        setSelectedVersionId(note.current_version.id);
      }
      setIsLoading(false);
    }, 100); // Minimal delay to simulate loading

    return () => clearTimeout(timer);
  }, [note, selectedVersionId]);

  const contextValue: NoteVersionContextType = {
    selectedVersionId,
    setSelectedVersionId,
    noteVersions,
    note,
    isLoading,
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

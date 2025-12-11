"use client";
import { useState, useMemo } from "react";
import NoteToolbar from "@/components/web/NoteToolbar";
import { Note, PrismaNoteVersion } from "@/lib/types/noteTypes";
import BaseNotePageContent from "./BaseNotePageContent";
import { useGetNote } from "@/hooks/note/useGetNote";
import { useGetNoteVersions } from "@/hooks/note/useGetNoteVersions";

interface WebNotePageContentProps {
  note: Note;
  noteVersions: PrismaNoteVersion[];
}

const WebNotePageContent = ({
  note: initialNote,
  noteVersions: initialNoteVersions,
}: WebNotePageContentProps) => {
  // State management
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    initialNote?.current_version?.id || null
  );
  const [chatOpen, setChatOpen] = useState(false);

  // Re-fetch note data with initial data
  const {
    data: note,
    isLoading: noteLoading,
    error: noteError,
  } = useGetNote(initialNote.id, {
    enabled: !!initialNote.id,
    initialData: initialNote,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Re-fetch note versions with initial data
  const {
    data: noteVersions,
    isLoading: versionsLoading,
    error: versionsError,
  } = useGetNoteVersions(initialNote.id, {
    enabled: !!initialNote.id,
    initialData: initialNoteVersions,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Compute selected version
  const selectedVersion = useMemo(() => {
    if (selectedVersionId && noteVersions) {
      return noteVersions.find((v) => v.id === selectedVersionId) || null;
    }
    return null;
  }, [selectedVersionId, noteVersions]);

  // Handlers
  const handleToggleChat = () => {
    setChatOpen((prev) => !prev);
  };

  const isLoading = noteLoading || versionsLoading;
  const error = noteError || versionsError;

  return (
    <BaseNotePageContent
      note={note || initialNote}
      noteVersions={noteVersions || initialNoteVersions}
      selectedVersionId={selectedVersionId}
      setSelectedVersionId={setSelectedVersionId}
      selectedVersion={selectedVersion}
      chatOpen={chatOpen}
      handleToggleChat={handleToggleChat}
      isLoading={isLoading}
      error={error}
      renderToolbar={(props) => <NoteToolbar {...props} />}
    />
  );
};

export default WebNotePageContent;

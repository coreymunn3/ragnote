"use client";
import { useState, useMemo } from "react";
import NoteToolbar from "@/components/web/NoteToolbar";
import { Note, PrismaNoteVersion } from "@/lib/types/noteTypes";
import BaseNotePageContent from "./BaseNotePageContent";
import { useGetNote } from "@/hooks/note/useGetNote";
import { useGetNoteVersions } from "@/hooks/note/useGetNoteVersions";
import EditorSkeleton from "@/components/skeletons/EditorSkeleton";

interface WebNotePageContentProps {
  noteId: string;
  initialNote: Note | null;
  initialNoteVersions: PrismaNoteVersion[];
}

const WebNotePageContent = ({
  noteId,
  initialNote,
  initialNoteVersions,
}: WebNotePageContentProps) => {
  // State management
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    initialNote?.current_version?.id || null,
  );
  const [chatOpen, setChatOpen] = useState(false);

  // Re-fetch note data with initial data
  const {
    data: noteData,
    isLoading: noteLoading,
    isFetching: noteFetching,
    error: noteError,
  } = useGetNote(noteId, {
    placeholderData: initialNote || undefined,
  });

  // Re-fetch note versions with initial data
  const {
    data: noteVersions,
    isLoading: versionsLoading,
    isFetching: versionsFetching,
    error: versionsError,
  } = useGetNoteVersions(noteId, {
    placeholderData: initialNoteVersions,
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

  // Combine loading states
  const isLoading =
    noteLoading ||
    noteFetching ||
    versionsLoading ||
    versionsFetching ||
    !noteData;

  // Determine error state
  const error =
    (!noteData && noteError) || (!noteVersions && versionsError)
      ? noteError || versionsError
      : null;

  if (isLoading && !noteData) {
    return <EditorSkeleton />;
  }

  // If we still don't have a note after loading, return skeleton or error
  if (!noteData) {
    return <EditorSkeleton />;
  }

  return (
    <BaseNotePageContent
      note={noteData}
      noteVersions={noteVersions || []}
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

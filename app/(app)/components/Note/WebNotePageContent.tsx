"use client";
import { useState, useMemo, useEffect } from "react";
import NoteToolbar from "@/components/web/NoteToolbar";
import BaseNotePageContent from "./BaseNotePageContent";
import { useGetNote } from "@/hooks/note/useGetNote";
import { useGetNoteVersions } from "@/hooks/note/useGetNoteVersions";
import WebNotePageSkeleton from "@/components/skeletons/WebNotePageSkeleton";

interface WebNotePageContentProps {
  noteId: string;
}

const WebNotePageContent = ({ noteId }: WebNotePageContentProps) => {
  // State management
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    null,
  );
  const [chatOpen, setChatOpen] = useState(false);

  // Fetch note data client-side
  const {
    data: noteData,
    isLoading: noteLoading,
    isFetching: noteFetching,
    error: noteError,
  } = useGetNote(noteId);

  // Fetch note versions client-side
  const {
    data: noteVersions,
    isLoading: versionsLoading,
    isFetching: versionsFetching,
    error: versionsError,
  } = useGetNoteVersions(noteId);

  // Set initial selected version when note data loads
  useEffect(() => {
    if (noteData?.current_version?.id && !selectedVersionId) {
      setSelectedVersionId(noteData.current_version.id);
    }
  }, [noteData, selectedVersionId]);

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
  const isLoading = (noteLoading || versionsLoading) && !noteData;

  // Determine error state
  const error =
    (!noteData && noteError) || (!noteVersions && versionsError)
      ? noteError || versionsError
      : null;

  if (isLoading && !noteData) {
    return <WebNotePageSkeleton />;
  }

  // If we still don't have a note after loading, return skeleton or error
  if (!noteData) {
    return <WebNotePageSkeleton />;
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

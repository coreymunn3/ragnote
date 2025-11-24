"use client";
import { useParams } from "next/navigation";
import RichTextEditor from "@/components/RichTextEditor";
import type { BlockNoteEditor } from "@blocknote/core";
import { useSaveNoteVersionContent } from "@/hooks/note/useSaveNoteVersionContent";
import { Skeleton } from "@/components/ui/skeleton";
import { debounce } from "lodash";
import MessageAlert from "@/components/MessageAlert";
import ChatPanel from "@/components/chat/ChatPanel";
import { Note, PrismaNoteVersion } from "@/lib/types/noteTypes";
import { useGetNote } from "@/hooks/note/useGetNote";
import { useGetNoteVersions } from "@/hooks/note/useGetNoteVersions";
import { useState, useMemo } from "react";

interface ToolbarProps {
  note: Note;
  noteVersions: PrismaNoteVersion[];
  selectedVersion: PrismaNoteVersion | null;
  selectedVersionId: string | null;
  setSelectedVersionId: (id: string | null) => void;
  loading: { noteLoading: boolean; versionsLoading: boolean };
  handleToggleChat: () => void;
}

interface BaseNotePageContentProps {
  note: Note;
  noteVersions: PrismaNoteVersion[];
  renderToolbar: (props: ToolbarProps) => React.ReactNode;
}

const BaseNotePageContent = ({
  note: initialNote,
  noteVersions: initialNoteVersions,
  renderToolbar,
}: BaseNotePageContentProps) => {
  const params: { id: string } = useParams();
  const { id: noteId } = params;

  // Local state for version selection and chat
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    initialNote?.current_version?.id || null
  );
  const [chatOpen, setChatOpen] = useState(false);

  // Re-fetch note data with initial data
  const {
    data: note,
    isLoading: noteLoading,
    error: noteError,
  } = useGetNote(noteId, {
    enabled: !!noteId,
    initialData: initialNote,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Re-fetch note versions with initial data
  const {
    data: noteVersions,
    isLoading: versionsLoading,
    error: versionsError,
  } = useGetNoteVersions(noteId, {
    enabled: !!noteId,
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

  const saveNoteVersionContent = useSaveNoteVersionContent();

  // Handle toggling the chat panel
  const handleToggleChat = () => {
    setChatOpen((prev) => !prev);
  };

  // Save editor content after debouncing
  const handleEditorChange = debounce((editor: BlockNoteEditor) => {
    if (selectedVersionId) {
      saveNoteVersionContent.mutate({
        noteId,
        versionId: selectedVersionId,
        richTextContent: editor.document,
      });
    }
  }, 1000);

  // Loading state
  const shouldShowLoading = noteLoading && !note;

  if (shouldShowLoading) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex-shrink-0">
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="flex-1 overflow-hidden pt-10">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (noteError || versionsError) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex-shrink-0">
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="flex-1 overflow-auto pt-8">
          <MessageAlert
            variant="error"
            title="Error Loading Note"
            description={`Error loading note versions: ${noteError?.message || versionsError?.message}`}
          />
        </div>
      </div>
    );
  }

  // Prepare toolbar props
  const toolbarProps: ToolbarProps = {
    note: note || initialNote,
    noteVersions: noteVersions || [],
    selectedVersion,
    selectedVersionId,
    setSelectedVersionId,
    loading: { noteLoading, versionsLoading },
    handleToggleChat,
  };

  // No version selected
  if (!selectedVersion || !selectedVersionId || !note) {
    const alertTitle = !note ? "Invalid Note" : "No Version Selected";
    const alertMessage = !note
      ? "The Note you wish to view cannot be found"
      : "No version is currently selected for this note.";
    return (
      <div className="flex flex-col h-screen">
        <div className="flex-shrink-0">{renderToolbar(toolbarProps)}</div>
        <div className="flex-1 overflow-auto pt-8">
          <MessageAlert
            variant="warning"
            title={alertTitle}
            description={alertMessage}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Toolbar - fixed at top */}
      <div className="flex-shrink-0">{renderToolbar(toolbarProps)}</div>
      {/* Editor - scrollable content */}
      <div className="flex-1 overflow-auto pt-2">
        <RichTextEditor
          key={selectedVersionId}
          initialContent={selectedVersion.rich_text_content}
          onChange={handleEditorChange}
          readOnly={selectedVersion.is_published || note.is_deleted}
        />
      </div>
      {/* Chat Panel */}
      <ChatPanel
        open={chatOpen}
        onOpenChange={handleToggleChat}
        title={`${note.title}`}
        scope="note"
        scopeId={noteId}
        note={note}
        noteVersions={noteVersions || []}
      />
    </div>
  );
};

export default BaseNotePageContent;

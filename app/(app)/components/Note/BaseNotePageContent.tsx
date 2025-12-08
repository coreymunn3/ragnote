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
import { useState, useEffect, useCallback, useMemo } from "react";
import { SaveStatusType } from "@/components/SaveStatus";

interface ToolbarProps {
  note: Note;
  noteVersions: PrismaNoteVersion[];
  selectedVersion: PrismaNoteVersion | null;
  selectedVersionId: string | null;
  setSelectedVersionId: (id: string | null) => void;
  loading: { noteLoading: boolean; versionsLoading: boolean };
  handleToggleChat: () => void;
  saveStatus: SaveStatusType;
  onRetrySave: () => void;
}

interface BaseNotePageContentProps {
  isMobile?: boolean;
  note: Note;
  noteVersions: PrismaNoteVersion[];
  selectedVersionId: string | null;
  setSelectedVersionId: (id: string | null) => void;
  selectedVersion: PrismaNoteVersion | null;
  chatOpen: boolean;
  handleToggleChat: () => void;
  isLoading?: boolean;
  error?: Error | null;
  renderToolbar?: (props: ToolbarProps) => React.ReactNode;
}

const BaseNotePageContent = ({
  isMobile = false,
  note,
  noteVersions,
  selectedVersionId,
  setSelectedVersionId,
  selectedVersion,
  chatOpen,
  handleToggleChat,
  isLoading = false,
  error = null,
  renderToolbar,
}: BaseNotePageContentProps) => {
  const params: { id: string } = useParams();
  const { id: noteId } = params;

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState<any>(null);

  const saveNoteVersionContent = useSaveNoteVersionContent({
    onSuccess: () => {
      setHasUnsavedChanges(false);
    },
  });

  // Save editor content after debouncing - memoized to prevent multiple instances
  const SAVE_DEBOUNCE = 1000;
  const handleEditorChange = useMemo(
    () =>
      debounce((editor: BlockNoteEditor) => {
        if (selectedVersionId) {
          saveNoteVersionContent.mutate({
            noteId,
            versionId: selectedVersionId,
            richTextContent: editor.document,
          });
        }
      }, SAVE_DEBOUNCE),
    [selectedVersionId, noteId, saveNoteVersionContent]
  );

  // Non-debounced handler to track unsaved changes immediately
  const handleEditorChangeImmediate = useCallback(
    (editor: BlockNoteEditor) => {
      setHasUnsavedChanges(true);
      handleEditorChange(editor);
    },
    [handleEditorChange]
  );

  // Cleanup debounced function on unmount or version change
  useEffect(() => {
    return () => {
      handleEditorChange.cancel();
    };
  }, [handleEditorChange]);

  // Calculate save status
  const saveStatus: SaveStatusType = saveNoteVersionContent.isError
    ? "error"
    : saveNoteVersionContent.isPending
      ? "saving"
      : hasUnsavedChanges
        ? "unsaved"
        : saveNoteVersionContent.isSuccess
          ? "saved"
          : "idle";

  // Retry save handler
  const handleRetrySave = useCallback(() => {
    if (selectedVersionId && lastSavedContent) {
      saveNoteVersionContent.mutate({
        noteId,
        versionId: selectedVersionId,
        richTextContent: lastSavedContent,
      });
    }
  }, [selectedVersionId, lastSavedContent, noteId, saveNoteVersionContent]);

  // Reset unsaved changes when version changes
  useEffect(() => {
    setHasUnsavedChanges(false);
    setLastSavedContent(selectedVersion?.rich_text_content);
  }, [selectedVersionId, selectedVersion]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)]">
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
  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0">
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="flex-1 overflow-auto pt-8">
          <MessageAlert
            variant="error"
            title="Error Loading Note"
            description={`Error loading note: ${error.message}`}
          />
        </div>
      </div>
    );
  }

  // Prepare toolbar props
  const toolbarProps: ToolbarProps = {
    note,
    noteVersions,
    selectedVersion,
    selectedVersionId,
    setSelectedVersionId,
    loading: { noteLoading: isLoading, versionsLoading: isLoading },
    handleToggleChat,
    saveStatus,
    onRetrySave: handleRetrySave,
  };

  // No version selected
  if (!selectedVersion || !selectedVersionId || !note) {
    const alertTitle = !note ? "Invalid Note" : "No Version Selected";
    const alertMessage = !note
      ? "The Note you wish to view cannot be found"
      : "No version is currently selected for this note.";
    return (
      <div className="flex flex-col h-full">
        {renderToolbar && (
          <div className="flex-shrink-0">{renderToolbar(toolbarProps)}</div>
        )}
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
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Toolbar - fixed at top (only for web view) */}
      {renderToolbar && (
        <div className="flex-shrink-0">{renderToolbar(toolbarProps)}</div>
      )}
      {/* Editor - scrollable content */}
      <div className="flex-1 overflow-auto pt-2">
        <RichTextEditor
          key={selectedVersionId}
          initialContent={selectedVersion.rich_text_content}
          onChange={handleEditorChangeImmediate}
          readOnly={selectedVersion.is_published || note.is_deleted}
        />
      </div>
      {/* Chat Panel */}
      <ChatPanel
        isMobile={isMobile}
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

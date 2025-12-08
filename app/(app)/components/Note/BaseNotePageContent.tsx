"use client";
import { useParams } from "next/navigation";
import RichTextEditor from "@/components/RichTextEditor";
import { Skeleton } from "@/components/ui/skeleton";
import MessageAlert from "@/components/MessageAlert";
import ChatPanel from "@/components/chat/ChatPanel";
import { Note, PrismaNoteVersion } from "@/lib/types/noteTypes";
import { SaveStatusType } from "@/components/SaveStatus";
import { useNoteAutoSave } from "@/hooks/note/useNoteAutoSave";

interface ToolbarProps {
  note: Note;
  noteVersions: PrismaNoteVersion[];
  selectedVersion: PrismaNoteVersion | null;
  selectedVersionId: string | null;
  setSelectedVersionId: (id: string | null) => void;
  loading: { noteLoading: boolean; versionsLoading: boolean };
  handleToggleChat: () => void;
  saveStatus: SaveStatusType;
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

  // Auto-save hook handles all save logic
  const { saveStatus, handleEditorChange } = useNoteAutoSave({
    noteId,
    versionId: selectedVersionId,
  });

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
          onChange={handleEditorChange}
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

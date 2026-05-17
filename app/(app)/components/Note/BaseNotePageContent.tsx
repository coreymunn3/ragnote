"use client";
import { useParams } from "next/navigation";
import RichTextEditor from "@/components/RichTextEditor";
import MessageAlert from "@/components/MessageAlert";
import ChatPanel from "@/components/chat/ChatPanel";
import NotePageSkeleton from "@/components/skeletons/NotePageSkeleton";
import { Note, PrismaNoteVersion } from "@/lib/types/noteTypes";
import { SaveStatusType } from "@/components/SaveStatus";
import { useNoteAutoSave } from "@/hooks/note/useNoteAutoSave";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

interface ToolbarProps {
  note: Note;
  noteVersions: PrismaNoteVersion[];
  selectedVersion: PrismaNoteVersion | null;
  selectedVersionId: string | null;
  setSelectedVersionId: (id: string | null) => void;
  isLoading: boolean;
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
  const isOnline = useOnlineStatus();

  // Auto-save hook handles all save logic
  const { saveStatus, handleEditorChange } = useNoteAutoSave({
    noteId,
    versionId: selectedVersionId,
  });

  // Prepare toolbar props
  const toolbarProps: ToolbarProps = {
    note,
    noteVersions,
    selectedVersion,
    selectedVersionId,
    setSelectedVersionId,
    isLoading,
    handleToggleChat,
    saveStatus,
  };

  // Error state - show error message
  if (error) {
    return (
      <div className="flex flex-col h-full">
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

  // Only show full page skeleton if we don't have the essential data yet
  // During refetches (isLoading=true but we have data), render normally and let toolbar show its own skeleton
  if (!note || !selectedVersion || !selectedVersionId) {
    return <NotePageSkeleton />;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Toolbar - fixed at top (only for web view) */}
      {renderToolbar && (
        <div className="flex-shrink-0 fixed top-12 left-0 right-0 z-40 bg-background/25 backdrop-blur-sm">
          {renderToolbar(toolbarProps)}
        </div>
      )}
      {/* Editor - scrollable content */}
      <div className="flex-1 overflow-auto pt-16">
        <RichTextEditor
          key={selectedVersionId}
          initialContent={selectedVersion.rich_text_content}
          onChange={handleEditorChange}
          readOnly={
            selectedVersion.is_published || note.is_deleted || !isOnline
          }
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

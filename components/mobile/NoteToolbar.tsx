import { usePublishNoteVersion } from "@/hooks/note/usePublishNoteVersion";
import { Note, PrismaNoteVersion } from "@/lib/types/noteTypes";
import { toast } from "sonner";
import ProButton from "../ProButton";
import { BookCheckIcon, MessageCircleIcon } from "lucide-react";

interface NoteToolbarProps {
  note: Note;
  selectedVersion: PrismaNoteVersion | null;
  selectedVersionId: string | null;
  setSelectedVersionId: (versionId: string) => void;
  handleToggleChat: () => void;
}

const NoteToolbar = ({
  note,
  selectedVersion,
  selectedVersionId,
  setSelectedVersionId,
  handleToggleChat,
}: NoteToolbarProps) => {
  const publishNoteVersionMutation = usePublishNoteVersion({
    onSuccess: (data) => {
      const { nextVersion } = data;
      setSelectedVersionId(nextVersion.id);
    },
  });

  /**
   * Publish the note version
   */
  const handlePublishNote = () => {
    if (note && selectedVersionId) {
      publishNoteVersionMutation.mutate({
        versionId: selectedVersionId,
        noteId: note.id,
      });
    } else {
      toast.error("Unable to Publish");
    }
  };

  return (
    <div className="flex items-center justify-end space-x-2 bg-background">
      {/* Chat toggle button */}
      <ProButton
        variant="ghost"
        icon={<MessageCircleIcon className="h-4 w-4" />}
        onClick={handleToggleChat}
      />

      {/* Publish button */}
      <ProButton
        icon={<BookCheckIcon className="h-4 w-4" />}
        variant="ghost"
        className="text-primary"
        onClick={handlePublishNote}
        isLoading={publishNoteVersionMutation.isPending}
        disabled={!selectedVersion || selectedVersion?.is_published}
      />
    </div>
  );
};
export default NoteToolbar;

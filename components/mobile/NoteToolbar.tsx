import { usePublishNoteVersion } from "@/hooks/note/usePublishNoteVersion";
import { Note, PrismaNoteVersion } from "@/lib/types/noteTypes";
import { toast } from "sonner";
import ProButton from "../ProButton";
import VersionSelector from "../VersionSelector";
import { useUserSubscription } from "@/hooks/user/useUserSubscription";
import { BookCheckIcon, CopyIcon, MessageCircleIcon } from "lucide-react";
import SaveStatus, { SaveStatusType } from "../SaveStatus";
import { useOfflineGuard } from "@/hooks/useOfflineGuard";
import { Button } from "../ui/button";

interface NoteToolbarProps {
  note: Note;
  selectedVersion: PrismaNoteVersion | null;
  selectedVersionId: string | null;
  setSelectedVersionId: (versionId: string) => void;
  handleToggleChat: () => void;
  noteVersions: PrismaNoteVersion[];
  saveStatus: SaveStatusType;
}

const NoteToolbar = ({
  note,
  selectedVersion,
  selectedVersionId,
  setSelectedVersionId,
  handleToggleChat,
  noteVersions,
  saveStatus,
}: NoteToolbarProps) => {
  const { isPro } = useUserSubscription();
  const publishNoteVersionMutation = usePublishNoteVersion({
    onSuccess: (data) => {
      const { nextVersion } = data;
      setSelectedVersionId(nextVersion.id);
    },
  });
  const { isOnline, guardMutation } = useOfflineGuard();

  /**
   * Publish the note version
   */
  const handlePublishNote = () => {
    guardMutation(() => {
      if (note && selectedVersionId) {
        publishNoteVersionMutation.mutate({
          versionId: selectedVersionId,
          noteId: note.id,
        });
      } else {
        toast.error("Unable to Publish");
      }
    });
  };

  /**
   * Copy the current selected note version content to the clipboard
   */
  const handleCopyNoteContent = async () => {
    if (selectedVersion?.plain_text_content) {
      try {
        await navigator.clipboard.writeText(
          selectedVersion?.plain_text_content,
        );
        toast.success("Note copied to clipboard");
      } catch (error) {
        toast.error("Failed to copy note");
      }
    }
  };

  return (
    <div className="flex items-center justify-between py-1 bg-transparent">
      {/* Left side: Version Selector and Save Status */}
      <div className="flex items-center space-x-2">
        {selectedVersion && (
          <>
            {isPro ? (
              <VersionSelector
                selectedVersion={selectedVersion}
                noteVersions={noteVersions}
                onSelect={(v) => setSelectedVersionId(v.id)}
              />
            ) : (
              <ProButton
                label={`v${selectedVersion.version_number}`}
                className={`px-3 ${
                  selectedVersion.is_published
                    ? "bg-primary text-primary-foreground shadow hover:bg-primary/80"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              />
            )}
          </>
        )}
        {/* Save Status Indicator */}
        {!selectedVersion?.is_published && !note.is_deleted && (
          <SaveStatus status={saveStatus} />
        )}
      </div>

      {/* Right side: Chat and Publish buttons */}
      <div className="flex items-center space-x-2">
        {/* Copy Note */}
        <Button variant={"ghost"} onClick={handleCopyNoteContent}>
          <CopyIcon className="h-4 w-4" />
        </Button>
        {/* Chat toggle button */}
        <ProButton
          variant="ghost"
          icon={<MessageCircleIcon className="h-4 w-4" />}
          onClick={handleToggleChat}
          disabled={!isOnline}
        />

        {/* Publish button */}
        <ProButton
          icon={<BookCheckIcon className="h-4 w-4" />}
          variant="ghost"
          className="text-primary"
          onClick={handlePublishNote}
          isLoading={publishNoteVersionMutation.isPending}
          disabled={
            !selectedVersion || selectedVersion?.is_published || !isOnline
          }
        />
      </div>
    </div>
  );
};
export default NoteToolbar;

import { usePublishNoteVersion } from "@/hooks/note/usePublishNoteVersion";
import { Note, PrismaNoteVersion } from "@/lib/types/noteTypes";
import { toast } from "sonner";
import ProButton from "../ProButton";
import VersionSelector from "../VersionSelector";
import { useUserSubscription } from "@/hooks/user/useUserSubscription";
import { BookCheckIcon, MessageCircleIcon } from "lucide-react";

interface NoteToolbarProps {
  note: Note;
  selectedVersion: PrismaNoteVersion | null;
  selectedVersionId: string | null;
  setSelectedVersionId: (versionId: string) => void;
  handleToggleChat: () => void;
  noteVersions: PrismaNoteVersion[];
}

const NoteToolbar = ({
  note,
  selectedVersion,
  selectedVersionId,
  setSelectedVersionId,
  handleToggleChat,
  noteVersions,
}: NoteToolbarProps) => {
  const { isPro } = useUserSubscription();
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
    <div className="flex items-center justify-between bg-background">
      {/* Left side: Version Selector */}
      <div className="flex items-center">
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
      </div>

      {/* Right side: Chat and Publish buttons */}
      <div className="flex items-center space-x-2">
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
    </div>
  );
};
export default NoteToolbar;

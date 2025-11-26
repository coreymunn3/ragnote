import { usePublishNoteVersion } from "@/hooks/note/usePublishNoteVersion";
import { useUpdateNote } from "@/hooks/note/useUpdateNote";
import { useUserSubscription } from "@/hooks/user/useUserSubscription";
import { Note, PrismaNoteVersion } from "@/lib/types/noteTypes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";
import EditableField from "../EditableField";
import ProButton from "../ProButton";
import { BookCheckIcon, MessageCircleIcon } from "lucide-react";
import VersionSelector from "../VersionSelector";

interface NoteToolbarProps {
  note: Note;
  noteVersions: PrismaNoteVersion[];
  selectedVersion: PrismaNoteVersion | null;
  selectedVersionId: string | null;
  setSelectedVersionId: (versionId: string) => void;
  loading: {
    noteLoading: boolean;
    versionsLoading: boolean;
  };
  handleToggleChat: () => void;
}

const NoteToolbar = ({
  note,
  noteVersions,
  selectedVersion,
  selectedVersionId,
  setSelectedVersionId,
  loading,
  handleToggleChat,
}: NoteToolbarProps) => {
  const router = useRouter();
  const { isPro } = useUserSubscription();
  // mutation to update note name
  const updateNoteMutation = useUpdateNote();
  const publishNoteVersionMutation = usePublishNoteVersion({
    onSuccess: (data, variables, context) => {
      const { nextVersion, publishedVersion } = data;
      setSelectedVersionId(nextVersion.id);
    },
  });

  /**
   * Save the new note title
   */
  const handleSaveTitle = (newTitle: string) => {
    if (note) {
      updateNoteMutation.mutate({
        noteId: note.id,
        action: "update_title",
        title: newTitle,
      });
    } else {
      toast.error("Unable to Update Title");
    }
  };

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

  // Only show loading if we don't have the essential data (note + versions)
  const shouldShowLoading = loading.noteLoading || loading.versionsLoading;
  // loading state
  if (shouldShowLoading || !note) {
    return (
      <div className="flex items-center justify-between p-2">
        <div className="flex items-end space-x-2">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-10" />
          <Skeleton className="h-8 w-10" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      {/* Left side - title and version */}
      <div className="flex items-end space-x-2">
        {/* title field that is editable */}
        <EditableField
          value={note.title}
          variant="bold"
          onSave={handleSaveTitle}
        />
        {/* version */}
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
      {/* right side - version and publish */}
      <div className="flex items-end space-x-2">
        {/* chat with note entry */}
        <ProButton
          variant={"ghost"}
          icon={<MessageCircleIcon className="h-4 w-4" />}
          onClick={handleToggleChat}
        />

        {/* publish */}
        <ProButton
          icon={<BookCheckIcon className="h-4 w-4" />}
          variant={"ghost"}
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

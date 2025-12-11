"use client";
import { useRouter } from "next/navigation";
import { Note, PrismaNoteVersion } from "@/lib/types/noteTypes";
import { TypographyMuted } from "../ui/typography";
import { BookCheckIcon, MessageCircleIcon, Trash2Icon } from "lucide-react";
import EditableField from "../EditableField";
import { DateTime } from "luxon";
import { useUpdateNote } from "@/hooks/note/useUpdateNote";
import { usePublishNoteVersion } from "@/hooks/note/usePublishNoteVersion";
import WebToolbarSkeleton from "../skeletons/WebToolbarSkeleton";
import { toast } from "sonner";
import ProButton from "../ProButton";
import { useUserSubscription } from "@/hooks/user/useUserSubscription";
import VersionSelector from "../VersionSelector";
import { Button } from "../ui/button";
import SaveStatus, { SaveStatusType } from "../SaveStatus";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

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
  saveStatus: SaveStatusType;
}

const NoteToolbar = ({
  note,
  noteVersions,
  selectedVersion,
  selectedVersionId,
  setSelectedVersionId,
  loading,
  handleToggleChat,
  saveStatus,
}: NoteToolbarProps) => {
  const router = useRouter();
  const { isPro } = useUserSubscription();

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
   * Soft delete a note
   */
  const handleDeleteNote = () => {
    if (note) {
      // soft delete
      updateNoteMutation.mutate({ action: "delete", noteId: note.id });
      // route user back to the folder
      router.push(`/folder/${note.folder_id}`);
    } else {
      toast.error("Unable to Delete");
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
    return <WebToolbarSkeleton variant="note" />;
  }

  return (
    <div className="flex items-center justify-between px-14 py-2">
      {/* left side - title and version */}
      <div className="flex items-center space-x-2">
        <EditableField
          value={note.title}
          variant="bold"
          onSave={handleSaveTitle}
        />
        {/* select version menu */}
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
      {/* right side - last edited, publish & controls */}

      <TooltipProvider>
        <div className="flex items-center space-x-2">
          {selectedVersion &&
            selectedVersion.updated_at &&
            (!selectedVersion.is_published || selectedVersion.published_at) && (
              <TypographyMuted className="text-xs">
                {selectedVersion.is_published ? "published" : "saved"}{" "}
                {selectedVersion.is_published && selectedVersion.published_at
                  ? DateTime.fromISO(
                      selectedVersion.published_at.toString()
                    ).toRelative()
                  : DateTime.fromISO(
                      selectedVersion.updated_at.toString()
                    ).toRelative()}
              </TypographyMuted>
            )}
          {/* publish note */}
          <Tooltip>
            <TooltipTrigger asChild>
              <ProButton
                icon={<BookCheckIcon className="h-4 w-4" />}
                variant={"ghost"}
                className="text-primary"
                onClick={handlePublishNote}
                isLoading={publishNoteVersionMutation.isPending}
                disabled={!selectedVersion || selectedVersion?.is_published}
              />
            </TooltipTrigger>
            <TooltipContent>Pubilsh this note</TooltipContent>
          </Tooltip>

          {/* chat with note entry */}
          <Tooltip>
            <TooltipTrigger asChild>
              <ProButton
                variant={"ghost"}
                icon={<MessageCircleIcon className="h-4 w-4" />}
                onClick={handleToggleChat}
              />
            </TooltipTrigger>
            <TooltipContent>Chat with this note</TooltipContent>
          </Tooltip>

          {/* delete */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant={"ghost"} onClick={handleDeleteNote}>
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete this note</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};
export default NoteToolbar;

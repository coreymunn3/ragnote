"use client";
import { useRouter } from "next/navigation";
import { Note, PrismaNoteVersion } from "@/lib/types/noteTypes";
import { TypographyH4, TypographyMuted } from "../ui/typography";
import { BookCheckIcon, MessageCircleIcon, Trash2Icon } from "lucide-react";
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
import { useOfflineGuard } from "@/hooks/useOfflineGuard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import ConfirmationDialog from "../dialogs/ConfirmationDialog";
import { useState } from "react";

interface NoteToolbarProps {
  note: Note;
  noteVersions: PrismaNoteVersion[];
  selectedVersion: PrismaNoteVersion | null;
  selectedVersionId: string | null;
  setSelectedVersionId: (versionId: string) => void;
  isLoading: boolean;
  handleToggleChat: () => void;
  saveStatus: SaveStatusType;
}

const NoteToolbar = ({
  note,
  noteVersions,
  selectedVersion,
  selectedVersionId,
  setSelectedVersionId,
  isLoading,
  handleToggleChat,
  saveStatus,
}: NoteToolbarProps) => {
  const router = useRouter();
  const { isPro } = useUserSubscription();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { isOnline, guardMutation } = useOfflineGuard();

  const updateNoteMutation = useUpdateNote();
  const publishNoteVersionMutation = usePublishNoteVersion({
    onSuccess: (data, variables, context) => {
      const { nextVersion, publishedVersion } = data;
      setSelectedVersionId(nextVersion.id);
    },
  });

  /**
   * Soft delete a note
   */
  const handleDeleteNote = () => {
    guardMutation(() => setDeleteOpen(true));
  };

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

  // loading state
  if (isLoading || !note) {
    return <WebToolbarSkeleton variant="note" />;
  }

  return (
    <div className="flex items-center justify-between px-14 py-2">
      {/* left side - title and version */}
      <div className="flex items-center space-x-2">
        <TypographyH4 className="mb-0 p-0">{note.title}</TypographyH4>
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
                {`saved ${DateTime.fromISO(
                  selectedVersion.updated_at.toString(),
                ).toRelative()}`}
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
                disabled={
                  !selectedVersion || selectedVersion?.is_published || !isOnline
                }
              />
            </TooltipTrigger>
            <TooltipContent>
              {!isOnline ? "You are offline" : "Pubilsh this note"}
            </TooltipContent>
          </Tooltip>

          {/* chat with note entry */}
          <Tooltip>
            <TooltipTrigger asChild>
              <ProButton
                variant={"ghost"}
                icon={<MessageCircleIcon className="h-4 w-4" />}
                onClick={handleToggleChat}
                disabled={!isOnline}
              />
            </TooltipTrigger>
            <TooltipContent>Chat with this note</TooltipContent>
          </Tooltip>

          {/* delete */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={"ghost"}
                onClick={handleDeleteNote}
                disabled={!isOnline}
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {!isOnline ? "You are offline" : "Delete this note"}
            </TooltipContent>
          </Tooltip>

          {/* Delete confirmation */}
          <ConfirmationDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            title={"Are you sure you want to delete?"}
            description="You will be able to recover this Note later, for a while"
            confirmText="Delete"
            confirmLoadingText="Deleting..."
            confirmVariant="destructive"
            onConfirm={() => {
              // soft delete
              updateNoteMutation.mutate({
                noteId: note.id,
                folderId: note.folder_id,
                action: "delete",
              });
              // route user back to the folder
              router.push(`/folder/${note.folder_id}`);
            }}
            isLoading={updateNoteMutation.isPending}
          />
        </div>
      </TooltipProvider>
    </div>
  );
};
export default NoteToolbar;

"use client";
import { useParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { PrismaNoteVersion } from "@/lib/types/noteTypes";
import VersionBadge from "./VersionBadge";
import { TypographyMuted } from "./ui/typography";
import { ForwardIcon, Trash2Icon } from "lucide-react";
import EditableField from "./EditableField";
import OptionsMenu from "./OptionsMenu";
import { useNoteVersionContext } from "@/contexts/NoteVersionContext";
import { DateTime } from "luxon";
import { useUpdateNote } from "@/hooks/note/useUpdateNote";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { usePublishNoteVersion } from "@/hooks/note/usePublishNoteVersion";
import { toast } from "sonner";
import AiButton from "./AiButton";

const NoteToolbar = () => {
  const { id } = useParams();
  const {
    note,
    noteVersions,
    selectedVersion,
    selectedVersionId,
    setSelectedVersionId,
    isLoading,
  } = useNoteVersionContext();

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
    if (note) {
      updateNoteMutation.mutate({ action: "delete", noteId: note.id });
    } else {
      toast.error("Unable to Delete");
    }
  };

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

  if (isLoading || !note) {
    return (
      <div className="flex items-center justify-between px-14 py-2">
        <div className="flex items-end space-x-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-16" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-10" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-14 py-2">
      {/* left side - title and version */}
      <div className="flex items-end  space-x-2">
        <EditableField
          value={note.title}
          variant="bold"
          onSave={handleSaveTitle}
        />
        {selectedVersion && (
          <DropdownMenu>
            <DropdownMenuTrigger className="p-1">
              <VersionBadge version={selectedVersion} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {noteVersions.map((version: PrismaNoteVersion) => (
                <DropdownMenuItem
                  key={version.id}
                  onClick={() => setSelectedVersionId(version.id)}
                >
                  <VersionBadge version={version} />
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {/* right side - last edited, publish & controls */}
      <div className="flex items-center space-x-2">
        {selectedVersion && (
          // if published show published at time, otherwise use updated_at to get last saved time
          <TypographyMuted>{`
            ${selectedVersion.is_published ? "published" : "last saved"} 
            ${
              selectedVersion.is_published && selectedVersion.published_at
                ? DateTime.fromISO(
                    selectedVersion.published_at.toString()
                  ).toRelative()
                : DateTime.fromISO(
                    selectedVersion.updated_at.toString()
                  ).toRelative()
            }
          `}</TypographyMuted>
        )}
        <AiButton
          label="Publish"
          onClick={handlePublishNote}
          isLoading={publishNoteVersionMutation.isPending}
          disabled={selectedVersion?.is_published}
          tooltipText={
            selectedVersion?.is_published
              ? "This version is already published"
              : undefined
          }
        />
        <OptionsMenu
          options={[
            {
              label: "Share",
              icon: <ForwardIcon className="h-4 w-4" />,
              onClick: () => console.log("TO DO - share note"),
            },
            {
              label: "Delete",
              icon: <Trash2Icon className="h-4 w-4" />,
              onClick: handleDeleteNote,
            },
          ]}
        />
      </div>
    </div>
  );
};
export default NoteToolbar;

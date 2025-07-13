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
import { useNoteVersion } from "@/contexts/NoteVersionContext";
import { DateTime } from "luxon";
import { useUpdateNote } from "@/hooks/note/useUpdateNote";
import { Skeleton } from "./ui/skeleton";

const NoteToolbar = () => {
  const { id } = useParams();
  const {
    note,
    noteVersions,
    selectedVersion,
    setSelectedVersionId,
    isLoading,
  } = useNoteVersion();

  const updateNoteMutation = useUpdateNote();

  if (isLoading || !note) {
    return (
      <div className="flex items-center justify-between px-14 py-2">
        <div className="flex items-end space-x-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-16" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-32" />
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
          onSave={(newTitle) => {
            updateNoteMutation.mutate({
              noteId: note.id,
              action: "update_title",
              title: newTitle,
            });
          }}
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
      {/* right side - last edited & controls */}
      <div className="flex items-center space-x-2">
        {selectedVersion && (
          <TypographyMuted>{`Saved ${DateTime.fromISO(selectedVersion.updated_at.toString()).toRelative()}`}</TypographyMuted>
        )}
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
              onClick: () => console.log("TO DO - Delete Note"),
            },
          ]}
        />
      </div>
    </div>
  );
};
export default NoteToolbar;

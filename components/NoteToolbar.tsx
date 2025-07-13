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

const NoteToolbar = () => {
  const { id } = useParams();
  const {
    note,
    noteVersions,
    selectedVersionId,
    setSelectedVersionId,
    isLoading,
  } = useNoteVersion();

  const updateNoteMutation = useUpdateNote();

  if (isLoading || !note) {
    return (
      <div className="flex items-center justify-between px-14 py-2">
        <div className="flex items-end space-x-2">
          <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  // Find the selected version for display
  const selectedVersion =
    noteVersions.find((v) => v.id === selectedVersionId) || noteVersions[0];

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
      </div>
      {/* right side - last edited & controls */}
      <div className="flex items-center space-x-2">
        <TypographyMuted>{`Saved ${DateTime.fromISO(note.updated_at.toString()).toLocaleString(DateTime.DATE_SHORT)}`}</TypographyMuted>
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

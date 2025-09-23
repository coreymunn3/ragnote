"use client";

import { Note } from "@/lib/types/noteTypes";
import { TypographyMuted, TypographySmall } from "../ui/typography";
import { Badge } from "../ui/badge";
import {
  FolderOutputIcon,
  PinIcon,
  PinOffIcon,
  Trash2Icon,
  UsersRoundIcon,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import OptionsMenu, { Option } from "../OptionsMenu";
import { useUpdateNote } from "@/hooks/note/useUpdateNote";
import { useGetFolders } from "@/hooks/folder/useGetFolders";
import SelectDialog, { SelectOption } from "../dialogs/SelectDialog";
import { useState } from "react";
import { DateTime } from "luxon";

interface NoteWidgetProps {
  note: Note;
  folderId?: string;
  pinned?: boolean;
}

const NoteWidget = ({ note, folderId, pinned = false }: NoteWidgetProps) => {
  const isPublished = note.current_version.is_published;
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);

  const updateNoteMutation = useUpdateNote();
  const { data: foldersData } = useGetFolders();

  const handleTogglePinNote = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    updateNoteMutation.mutate({
      noteId: note.id,
      folderId,
      action: "toggle_pin",
    });
  };

  const handleDeleteNote = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    updateNoteMutation.mutate({
      noteId: note.id,
      folderId,
      action: "delete",
    });
  };

  const handleOpenMoveDialog = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setMoveDialogOpen(true);
  };

  const handleConfirmMove = (selectedFolderId: string) => {
    updateNoteMutation.mutate(
      {
        noteId: note.id,
        folderId: selectedFolderId,
        action: "move",
      },
      {
        onSuccess: () => {
          setMoveDialogOpen(false);
        },
      }
    );
  };

  // Prepare folder options for the select dialog
  const folderOptions: SelectOption<string>[] = foldersData?.user
    ? foldersData.user
        .filter((folder) => folder.id !== folderId) // Exclude current folder
        .map((folder) => ({
          value: folder.id,
          label: `${folder.folder_name} (${folder.items.length} items)`,
        }))
    : [];

  // list of actions a user can take on a note
  const noteActions: Option[] = [
    pinned
      ? {
          label: "Unpin",
          icon: <PinOffIcon className="h-4 w-4" />,
          onClick: handleTogglePinNote,
        }
      : {
          label: "Pin",
          icon: <PinIcon className="h-4 w-4" />,
          onClick: handleTogglePinNote,
        },
    {
      label: "Move",
      icon: <FolderOutputIcon className="h-4 w-4" />,
      onClick: handleOpenMoveDialog,
    },
    {
      label: "Delete",
      icon: <Trash2Icon className="h-4 w-4" />,
      onClick: handleDeleteNote,
    },
  ];

  // Construct note URL
  const noteUrl = `/note/${note.id}`;

  return (
    <>
      <Link href={noteUrl} className="block w-full h-full">
        <Card
          variant="dense"
          className={`${pinned && "bg-primary/15"} ${!pinned && "min-w-[250px]"} cursor-pointer hover:shadow-md hover:text-primary transition-all duration-200`}
        >
          {/* Note Widget Header */}
          <CardHeader>
            <div className="flex justify-between items-center">
              {/* Header left - title & icon */}
              <div className="flex items-center space-x-2">
                {pinned && <PinIcon className="h-4 w-4" />}
                <CardTitle className="text-base font-semibold line-clamp-1 overflow-ellipsis">
                  {note.title}
                </CardTitle>
              </div>
              {/* Header right - the published badge and options */}
              <div className="flex items-center justify-center space-x-2">
                <Badge
                  variant={isPublished ? "default" : "secondary"}
                  className={`ml-2 whitespace-nowrap flex-shrink-0 ${pinned && !isPublished && "border-stone-500"}`}
                >
                  v{note.current_version.version_number}
                </Badge>
                <OptionsMenu options={noteActions} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TypographyMuted
              className={`line-clamp-2 h-10 ${pinned && "line-clamp-4 h-20"} overflow-ellipsis`}
            >
              {note.preview}
            </TypographyMuted>
          </CardContent>
          <CardFooter>
            <div className="flex justify-between w-full">
              {/* Last Edited */}
              <div className="flex items-center text-muted-foreground">
                <TypographySmall>
                  {DateTime.fromJSDate(
                    new Date(note.current_version.updated_at)
                  ).toRelative()}
                </TypographySmall>
              </div>
              {/* Shared With */}
              {note.shared_with_count > 0 && (
                <div className="flex items-center text-muted-foreground">
                  <UsersRoundIcon className="h-4 w-4 mr-1.5" />
                  <TypographySmall>{note.shared_with_count}</TypographySmall>
                </div>
              )}
            </div>
          </CardFooter>
        </Card>
      </Link>

      {/* Move Note Dialog */}
      <SelectDialog
        open={moveDialogOpen}
        onOpenChange={setMoveDialogOpen}
        title="Move Note to Folder"
        placeholder="Select a folder"
        confirmText="Move Note"
        confirmLoadingText="Moving..."
        options={folderOptions}
        onConfirm={handleConfirmMove}
        isLoading={updateNoteMutation.isPending}
      />
    </>
  );
};

export default NoteWidget;

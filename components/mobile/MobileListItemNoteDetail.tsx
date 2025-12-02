"use client";
import {
  FolderOutputIcon,
  PinIcon,
  PinOffIcon,
  Trash2Icon,
} from "lucide-react";
import OptionsMenu from "../OptionsMenu";
import VersionBadge from "../VersionBadge";
import { Note } from "@/lib/types/noteTypes";
import { useState } from "react";
import { useUpdateNote } from "@/hooks/note/useUpdateNote";
import SelectDialog, { SelectOption } from "../dialogs/SelectDialog";
import { useGetFolders } from "@/hooks/folder/useGetFolders";

interface MobileListItemNoteDetailProps {
  note: Note;
}

const MobileListItemNoteDetail = ({ note }: MobileListItemNoteDetailProps) => {
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  // queries & mutations
  const updateNoteMutation = useUpdateNote();
  const { data: foldersData } = useGetFolders();
  // Handlers
  const handleTogglePinNote = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    updateNoteMutation.mutate({
      noteId: note.id,
      folderId: note.folder_id,
      action: "toggle_pin",
    });
  };

  const handleDeleteNote = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    updateNoteMutation.mutate({
      noteId: note.id,
      folderId: note.folder_id,
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
        .filter((folder) => folder.id !== note.folder_id) // Exclude current folder
        .map((folder) => ({
          value: folder.id,
          label: `${folder.folder_name} (${folder.items.length} items)`,
        }))
    : [];

  return (
    <>
      <VersionBadge version={note.current_version} />
      <OptionsMenu
        options={[
          note.is_pinned
            ? {
                label: "UnPin",
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
        ]}
      />

      {/* Move Note dialog */}
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
export default MobileListItemNoteDetail;

"use client";
import {
  ArchiveRestore,
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
import ConfirmationDialog from "../dialogs/ConfirmationDialog";

interface MobileListItemNoteDetailProps {
  note: Note;
}

const MobileListItemNoteDetail = ({ note }: MobileListItemNoteDetailProps) => {
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
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
    setDeleteOpen(true);
  };

  const handleOpenMoveDialog = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setMoveDialogOpen(true);
  };

  const handleRecover = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    updateNoteMutation.mutate({
      noteId: note.id,
      folderId: note.folder_id,
      action: "recover",
    });
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
      },
    );
  };

  // Prepare folder options for the select dialog
  const folderOptions: SelectOption<string>[] = foldersData
    ? foldersData
        .filter((folder) => folder.id !== note.folder_id) // Exclude current folder
        .map((folder) => ({
          value: folder.id,
          label: `${folder.folder_name} (${folder.items.length} items)`,
        }))
    : [];

  // list of actions a user can take on a note
  const createNoteActions = () => {
    const optionsArr = [];
    // if note is deleted, only option is to recover
    if (note.is_deleted) {
      optionsArr.push({
        label: "Recover",
        icon: <ArchiveRestore className="h-4 w-4" />,
        onClick: handleRecover,
      });
    } else {
      // if note not deleted, you can move or delete it, or pin/unpin
      optionsArr.push(
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
      );
      if (note.is_pinned) {
        optionsArr.push({
          label: "Unpin",
          icon: <PinOffIcon className="h-4 w-4" />,
          onClick: handleTogglePinNote,
        });
      } else {
        optionsArr.push({
          label: "Pin",
          icon: <PinIcon className="h-4 w-4" />,
          onClick: handleTogglePinNote,
        });
      }
    }

    return optionsArr;
  };

  return (
    <>
      <VersionBadge version={note.current_version} context="note" />
      <OptionsMenu options={createNoteActions()} />

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

      {/* Delete Note confirmation dialog */}
      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={"Are you sure you want to delete?"}
        description="You will be able to recover this Note later, for a while."
        confirmText="Delete"
        confirmVariant="destructive"
        onConfirm={() => {
          updateNoteMutation.mutate({
            noteId: note.id,
            folderId: note.folder_id,
            action: "delete",
          });
        }}
        isLoading={updateNoteMutation.isPending}
      />
    </>
  );
};
export default MobileListItemNoteDetail;

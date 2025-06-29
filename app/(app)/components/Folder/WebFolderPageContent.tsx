"use client";

import { AnimatedListItem, AnimatedTypography } from "@/components/animations";
import { Separator } from "@/components/ui/separator";
import { TypographyMuted } from "@/components/ui/typography";
import WidgetList from "@/components/web/WidgetList";
import NoteWidget from "@/components/web/NoteWidget";
import { Button } from "@/components/ui/button";
import { FilePlus2Icon, FolderPenIcon, Trash2Icon } from "lucide-react";
import OptionsMenu from "@/components/OptionsMenu";
import { FolderWithNotes } from "@/lib/types/folderTypes";
import { useRenameFolder } from "@/hooks/folder/useRenameFolder";
import { useDeleteFolder } from "@/hooks/folder/useDeleteFolder";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import InputDialog from "@/components/dialogs/InputDialog";

interface WebFolderPageContentProps {
  folder: FolderWithNotes;
}

const WebFolderPageContent = ({ folder }: WebFolderPageContentProps) => {
  const router = useRouter();
  // dialog state management
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  // hooks for folder operations
  const renameFolder = useRenameFolder();
  const deleteFolder = useDeleteFolder();
  // separate pinned and unpinned notes to render them in different lists
  const unpinnedNotes = folder.notes.filter((note) => !note.is_pinned);
  const pinnedNotes = folder.notes.filter((note) => note.is_pinned);

  return (
    <div>
      <div className="flex items-center justify-between">
        <AnimatedTypography variant="h1">
          {folder.folder_name}
        </AnimatedTypography>
        <div className="flex space-x-2 items-center">
          <TypographyMuted>{`${folder.notes.length} Items`}</TypographyMuted>
          {/* convert this into a CreateFile component similar to CreateFolder */}
          <Button variant={"ghost"}>
            <FilePlus2Icon className="h-4 w-4" />
          </Button>
          <OptionsMenu
            options={[
              {
                label: "Rename",
                icon: <FolderPenIcon className="h-4 w-4" />,
                onClick: () => setRenameOpen(true),
              },
              {
                label: "Delete",
                icon: <Trash2Icon className="h-4 w-4" />,
                onClick: () => setDeleteOpen(true),
              },
            ]}
          />
        </div>
      </div>
      <Separator orientation="horizontal" className="mb-6" />

      <div className="flex flex-col space-y-4">
        {/* Display pinned notes prominently */}
        {pinnedNotes.length > 0 && (
          <AnimatedListItem index={1} animation="fadeIn">
            <WidgetList
              items={pinnedNotes}
              renderItem={(note) => <NoteWidget note={note} pinned />}
              displayMode="vertical"
              delay={1}
            />
          </AnimatedListItem>
        )}

        {/* Display notes in a responsive grid layout */}
        <AnimatedListItem index={2} animation="fadeIn">
          <WidgetList
            items={unpinnedNotes}
            renderItem={(note) => <NoteWidget note={note} />}
            displayMode="grid"
            delay={2}
          />
        </AnimatedListItem>
      </div>

      {/* Rename Dialog */}
      <InputDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        title="Rename This Folder"
        placeholder="Folder Name"
        confirmText="Rename"
        confirmLoadingText="Renaming..."
        onConfirm={(inputValue) => {
          renameFolder.mutate({
            folderId: folder.id,
            newFolderName: inputValue,
          });
        }}
        isLoading={renameFolder.isPending}
        validate={(value) => value.trim().length > 0}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Are You Sure?"
        description="You will be able to recover this folder later, for a while"
        confirmText="Delete"
        confirmLoadingText="Deleting..."
        confirmVariant="destructive"
        onConfirm={() => {
          deleteFolder.mutate({ folderId: folder.id });
          router.push("/dashboard");
        }}
        isLoading={deleteFolder.isPending}
      />
    </div>
  );
};
export default WebFolderPageContent;

"use client";

import { AnimatedListItem, AnimatedTypography } from "@/components/animations";
import { Separator } from "@/components/ui/separator";
import { TypographyMuted } from "@/components/ui/typography";
import WidgetList from "@/components/web/WidgetList";
import NoteWidget from "@/components/web/NoteWidget";
import { Button } from "@/components/ui/button";
import { FilePlus2Icon, FolderPenIcon, Trash2Icon } from "lucide-react";
import OptionsMenu from "@/components/OptionsMenu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FolderWithNotes } from "@/lib/types/folderTypes";
import { useRenameFolder } from "@/hooks/folder/useRenameFolder";
import { useDeleteFolder } from "@/hooks/folder/useDeleteFolder";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface WebFolderPageContentProps {
  folder: FolderWithNotes;
}

const WebFolderPageContent = ({ folder }: WebFolderPageContentProps) => {
  const router = useRouter();
  // dialog, hook, and method to rename the folder
  const [renameOpen, setRenameOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const renameFolder = useRenameFolder();
  const handleRenameFolder = () => {
    renameFolder.mutate({ folderId: folder.id, newFolderName });
    setRenameOpen(false);
  };
  // dialog, hook, and method to delete the folder
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteFolder = useDeleteFolder();
  const handleDeleteFolder = () => {
    deleteFolder.mutate({ folderId: folder.id });
    setDeleteOpen(false);
    // route the user back home
    router.push("/dashboard");
  };
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

      {/* dialog to rename  */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename This Folder</DialogTitle>
            <Input
              placeholder="Folder Name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={"ghost"}>Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleRenameFolder}
              disabled={!newFolderName || renameFolder.isPending}
            >
              {renameFolder.isPending ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* dialog to confirm delete */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are You Sure?</DialogTitle>
            <DialogDescription>
              You will be able to recover this folder later, for a while
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={"ghost"}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleDeleteFolder} variant={"destructive"}>
              {deleteFolder.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default WebFolderPageContent;

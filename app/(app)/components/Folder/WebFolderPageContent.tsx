"use client";

import { AnimatedListItem, AnimatedTypography } from "@/components/animations";
import { Separator } from "@/components/ui/separator";
import { TypographyMuted } from "@/components/ui/typography";
import WidgetList from "@/components/web/WidgetList";
import NoteWidget from "@/components/web/NoteWidget";
import { Button } from "@/components/ui/button";
import { FilePlus2Icon, FolderPenIcon, Trash2Icon } from "lucide-react";
import OptionsMenu from "@/components/OptionsMenu";
import { FolderWithItems } from "@/lib/types/folderTypes";
import { Note } from "@/lib/types/noteTypes";
import { useRenameFolder } from "@/hooks/folder/useRenameFolder";
import { useDeleteFolder } from "@/hooks/folder/useDeleteFolder";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import InputDialog from "@/components/dialogs/InputDialog";
import { useGetFolderById } from "@/hooks/folder/useGetFolderById";
import CreateNote from "@/components/CreateNote";
import { ChatSession } from "@/lib/types/chatTypes";
import ConversationWidget from "@/components/web/ConversationWidget";

interface WebFolderPageContentProps {
  folder: FolderWithItems;
}

const WebFolderPageContent = ({ folder }: WebFolderPageContentProps) => {
  console.log(folder);
  const router = useRouter();
  // dialog state management
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  // get the folder data
  const folderData = useGetFolderById(folder.id, {
    initialData: folder,
    staleTime: 0,
    refetchOnMount: true,
  });
  // hooks for folder operations
  const renameFolder = useRenameFolder();
  const deleteFolder = useDeleteFolder();

  // Separate pinned and unpinned items - both Note and ChatSession have is_pinned
  const unpinnedItems = folderData.data!.items.filter(
    (item: Note | ChatSession) => !item.is_pinned
  );
  const pinnedItems = folderData.data!.items.filter(
    (item: Note | ChatSession) => item.is_pinned
  );

  // Render method that handles both Note and ChatSession types based on folder.itemType
  const renderItemWidgetList = (
    items: (Note | ChatSession)[],
    displayMode: "vertical" | "grid",
    delay: number
  ) => {
    if (items.length === 0) return null;

    if (folder.itemType === "note") {
      const notes = items as Note[];
      return (
        <WidgetList<Note>
          items={notes}
          renderItem={(note) => (
            <NoteWidget
              note={note}
              folderId={folder.id}
              pinned={displayMode === "vertical"}
            />
          )}
          displayMode={displayMode}
          delay={delay}
        />
      );
    } else if (folder.itemType === "chat") {
      const chatSessions = items as ChatSession[];
      return (
        <WidgetList<ChatSession>
          items={chatSessions}
          renderItem={(chatSession) => (
            <ConversationWidget chatSession={chatSession} />
          )}
          displayMode={displayMode}
          delay={delay}
        />
      );
    }

    return null;
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <AnimatedTypography variant="h1">
          {folderData.data!.folder_name}
        </AnimatedTypography>
        <div className="flex space-x-2 items-center">
          <TypographyMuted>{`${folderData.data!.items.length} Items`}</TypographyMuted>
          {/* convert this into a CreateFile component similar to CreateFolder */}
          <CreateNote folderId={folder.id} />
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
        {/* Display pinned items prominently */}
        {pinnedItems.length > 0 && (
          <AnimatedListItem index={1} animation="fadeIn">
            {renderItemWidgetList(pinnedItems, "vertical", 1)}
          </AnimatedListItem>
        )}

        {/* Display unpinned items in a responsive grid layout */}
        {unpinnedItems.length > 0 && (
          <AnimatedListItem index={2} animation="fadeIn">
            {renderItemWidgetList(unpinnedItems, "grid", 2)}
          </AnimatedListItem>
        )}
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

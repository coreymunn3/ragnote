"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetFolderById } from "@/hooks/folder/useGetFolderById";
import { FolderWithItems } from "@/lib/types/folderTypes";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import InputDialog from "@/components/dialogs/InputDialog";
import MobileList from "@/components/mobile/MobileList";
import { isSystemFolder } from "@/lib/utils/folderUtils";
import { useRenameFolder } from "@/hooks/folder/useRenameFolder";
import { useDeleteFolder } from "@/hooks/folder/useDeleteFolder";
import { FolderPenIcon, Trash2Icon } from "lucide-react";

interface MobileFolderPageContentProps {
  folder: FolderWithItems;
}

const MobileFolderPageContent = ({ folder }: MobileFolderPageContentProps) => {
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
  // determine if this is a system folder or user folder
  const isUserFolder = !isSystemFolder(folderData.data!.id);
  // hooks for folder operations
  const renameFolder = useRenameFolder();
  const deleteFolder = useDeleteFolder();

  return (
    <div>
      <MobileList
        type={folderData.data!.itemType}
        items={folderData.data!.items}
        title={folderData.data!.folder_name}
        options={
          isUserFolder
            ? [
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
              ]
            : []
        }
      />

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
export default MobileFolderPageContent;

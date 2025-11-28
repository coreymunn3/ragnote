"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetFolderById } from "@/hooks/folder/useGetFolderById";
import { FolderWithItems } from "@/lib/types/folderTypes";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import InputDialog from "@/components/dialogs/InputDialog";
import MobileList from "@/components/mobile/MobileList";
import { isSystemFolder } from "@/lib/utils/folderUtils";
import { useRenameFolder } from "@/hooks/folder/useRenameFolder";
import { useDeleteFolder } from "@/hooks/folder/useDeleteFolder";
import { ArrowLeftIcon, FolderPenIcon, Trash2Icon } from "lucide-react";
import CreateNote from "@/components/CreateNote";
import { useMobileHeader } from "@/contexts/MobileHeaderContext";
import { Button } from "@/components/ui/button";
import OptionsMenu from "@/components/OptionsMenu";
import { TypographyH4 } from "@/components/ui/typgrophy";

interface MobileFolderPageContentProps {
  folder: FolderWithItems;
}

const MobileFolderPageContent = ({ folder }: MobileFolderPageContentProps) => {
  const router = useRouter();
  const { setHeaderConfig, resetHeaderConfig } = useMobileHeader();
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

  // Set header configuration for Folder page
  useEffect(() => {
    if (folderData.data) {
      setHeaderConfig({
        leftContent: (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            <TypographyH4 className="pb-0">
              {folderData.data.folder_name}
            </TypographyH4>
          </>
        ),
        rightContent: isUserFolder ? (
          <>
            <CreateNote folderId={folderData.data.id} />
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
          </>
        ) : (
          <CreateNote folderId={folderData.data.id} />
        ),
      });
    }

    return () => {
      resetHeaderConfig();
    };
  }, [
    folderData.data,
    isUserFolder,
    router,
    setHeaderConfig,
    resetHeaderConfig,
  ]);

  return (
    <div>
      <MobileList
        type={folderData.data!.itemType}
        items={folderData.data!.items}
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

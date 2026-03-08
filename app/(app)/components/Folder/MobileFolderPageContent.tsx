"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetFolderById } from "@/hooks/folder/useGetFolderById";
import { FolderWithItems } from "@/lib/types/folderTypes";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import InputDialog from "@/components/dialogs/InputDialog";
import MobileList from "@/components/mobile/MobileList";
import { useRenameFolder } from "@/hooks/folder/useRenameFolder";
import { useDeleteFolder } from "@/hooks/folder/useDeleteFolder";
import { FolderPenIcon, Trash2Icon } from "lucide-react";
import CreateNote from "@/components/CreateNote";
import { useMobileHeader } from "@/contexts/MobileHeaderContext";
import OptionsMenu from "@/components/OptionsMenu";
import MobilePageTitle from "@/components/mobile/MobilePageTitle";
import { Note } from "@/lib/types/noteTypes";
import { ChatSession } from "@/lib/types/chatTypes";
import MobileListSkeleton from "@/components/skeletons/MobileListSkeleton";
import MobileBackButton from "@/components/mobile/MobileBackButton";
import CommandBar from "@/components/commandbar/CommandBar";

interface MobileFolderPageContentProps {
  folderId: string;
  initialFolder: FolderWithItems | null;
}

const MobileFolderPageContent = ({
  folderId,
  initialFolder,
}: MobileFolderPageContentProps) => {
  const router = useRouter();
  const { setHeaderConfig, resetHeaderConfig } = useMobileHeader();
  // dialog state management
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  // get the folder data
  const folderData = useGetFolderById(folderId, {
    placeholderData: initialFolder || undefined,
    // Removed staleTime: 0 and refetchOnMount: true to use global defaults
  });

  // hooks
  const renameFolder = useRenameFolder();
  const deleteFolder = useDeleteFolder();

  // Set header configuration for Folder page (must call useEffect before any returns)
  useEffect(() => {
    if (folderData.data) {
      setHeaderConfig({
        leftContent: (
          <>
            <MobileBackButton onClick={() => router.push("/dashboard")} />
            <MobilePageTitle title={folderData.data.folder_name} />
          </>
        ),
        rightContent: (
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
        ),
      });
    }

    return () => {
      resetHeaderConfig();
    };
  }, [folderData.data, router, setHeaderConfig, resetHeaderConfig]);

  // Show loading skeleton while fetching
  if (folderData.isLoading || !folderData.data) {
    return (
      <div>
        <MobileListSkeleton
          showTitle={false}
          showAction={false}
          itemCount={3}
        />
      </div>
    );
  }

  // Separate pinned and unpinned items - both Note and ChatSession have is_pinned
  const unpinnedItems = folderData.data.items.filter(
    (item: Note | ChatSession) => !item.is_pinned,
  );
  const pinnedItems = folderData.data.items.filter(
    (item: Note | ChatSession) => item.is_pinned,
  );

  return (
    <div>
      <div className="flex flex-col space-y-8">
        {/* Folder-scoped command bar - chat only (search is always global) */}
        <CommandBar scope="folder" scopeId={folderId} allowedModes={["chat"]} />

        {/* list of pinned items */}
        {pinnedItems.length > 0 && (
          <MobileList
            type={folderData.data.itemType}
            items={pinnedItems}
            title="Pinned"
            emptyContentMessage="No pinned items yet"
          />
        )}

        {/* list of unpinned items */}
        {
          <MobileList
            type={folderData.data.itemType}
            items={unpinnedItems}
            emptyContentMessage="No items yet"
          />
        }
      </div>

      {/* Rename Dialog */}
      <InputDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        title="Rename This Folder"
        initialValue={folderData.data.folder_name}
        confirmText="Rename"
        confirmLoadingText="Renaming..."
        onConfirm={(inputValue) => {
          renameFolder.mutate({
            folderId: folderId,
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
        title={"Are you sure you want to delete?"}
        description="Any notes still in this folder will be deleted when the folder is deleted. You will still be able to recover them in the recently deleted folder."
        confirmText="Delete"
        confirmLoadingText="Deleting..."
        confirmVariant="destructive"
        onConfirm={() => {
          deleteFolder.mutate({ folderId: folderId });
          router.push("/dashboard");
        }}
        isLoading={deleteFolder.isPending}
      />
    </div>
  );
};
export default MobileFolderPageContent;

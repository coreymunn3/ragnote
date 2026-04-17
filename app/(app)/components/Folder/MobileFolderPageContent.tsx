"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetFolderById } from "@/hooks/folder/useGetFolderById";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import InputDialog from "@/components/dialogs/InputDialog";
import MobileList from "@/components/mobile/MobileList";
import { useUpdateFolder } from "@/hooks/folder/useUpdateFolder";
import { useDeleteFolder } from "@/hooks/folder/useDeleteFolder";
import {
  ArchiveRestore,
  FolderPenIcon,
  Loader2Icon,
  Trash2Icon,
} from "lucide-react";
import CreateNote from "@/components/CreateNote";
import { useMobileHeader } from "@/contexts/MobileHeaderContext";
import OptionsMenu from "@/components/OptionsMenu";
import MobilePageTitle from "@/components/mobile/MobilePageTitle";
import { Note } from "@/lib/types/noteTypes";
import { ChatSession } from "@/lib/types/chatTypes";
import MobileListSkeleton from "@/components/skeletons/mobile/MobileListSkeleton";
import MobileBackButton from "@/components/mobile/MobileBackButton";
import CommandBar from "@/components/commandbar/CommandBar";
import MessageAlert from "@/components/MessageAlert";
import { Button } from "@/components/ui/button";

interface MobileFolderPageContentProps {
  folderId: string;
}

const MobileFolderPageContent = ({
  folderId,
}: MobileFolderPageContentProps) => {
  const router = useRouter();
  const { setHeaderConfig, resetHeaderConfig } = useMobileHeader();
  // dialog state management
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  // Fetch the folder data client-side
  const folderData = useGetFolderById(folderId);

  // hooks
  const updateFolder = useUpdateFolder();
  const deleteFolder = useDeleteFolder();

  const isDeleted = folderData.data?.is_deleted;

  // Handle recover action
  const handleRecover = () => {
    if (folderData.data) {
      updateFolder.mutate({
        folderId: folderData.data.id,
        action: "recover",
      });
    }
  };

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
        rightContent: isDeleted ? (
          <Button
            size="sm"
            onClick={handleRecover}
            disabled={updateFolder.isPending}
          >
            {updateFolder.isPending ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <ArchiveRestore className="h-4 w-4" />
            )}
          </Button>
        ) : (
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
  }, [
    folderData.data,
    router,
    setHeaderConfig,
    resetHeaderConfig,
    isDeleted,
    updateFolder.isPending,
  ]);

  // Handle error state
  if (folderData.error) {
    return (
      <MessageAlert
        variant="error"
        title="Error Loading Folder"
        description="This folder could not be found or you don't have access to it."
      />
    );
  }

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
      {/* Deleted folder warning banner */}
      {isDeleted && (
        <div className="mb-4">
          <MessageAlert
            variant="warning"
            title="This folder has been deleted"
            description="You're viewing a deleted folder in read-only mode. You can recover it to restore full access."
          />
        </div>
      )}

      <div className="flex flex-col space-y-8">
        {/* Folder-scoped command bar - chat only (search is always global) - hide if deleted */}
        {!isDeleted && (
          <CommandBar
            scope="folder"
            scopeId={folderId}
            allowedModes={["chat"]}
          />
        )}

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
          updateFolder.mutate({
            folderId: folderId,
            action: "rename",
            folderName: inputValue,
          });
        }}
        isLoading={updateFolder.isPending}
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
          deleteFolder.mutate(
            { folderId: folderId },
            {
              onSuccess: () => {
                // route user to dashboard AFTER mutation completes
                router.push("/dashboard");
              },
            },
          );
        }}
        isLoading={deleteFolder.isPending}
      />
    </div>
  );
};
export default MobileFolderPageContent;

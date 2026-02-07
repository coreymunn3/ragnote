"use client";
import { useCreateFolder } from "@/hooks/folder/useCreateFolder";
import { Button } from "./ui/button";
import { FolderPlusIcon } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import InputDialog from "@/components/dialogs/InputDialog";
import { useOfflineGuard } from "@/hooks/useOfflineGuard";

const CreateFolder = () => {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const { isOnline, guardMutation } = useOfflineGuard();

  const createFolderMutation = useCreateFolder({
    onSuccess: (folder) => {
      // Close dialog on successful folder creation
      setDialogOpen(false);
      // route user to new folder
      router.push(`/folder/${folder.id}`);
    },
  });

  const handleOpenDialog = () => {
    guardMutation(() => setDialogOpen(true));
  };

  return (
    <>
      <Button
        variant={"ghost"}
        className="w-full flex justify-start h-[44px] hover:bg-primary/30 dark:hover:bg-primary/30 transition-colors duration-200"
        disabled={createFolderMutation.isPending || !isOnline}
        onClick={handleOpenDialog}
        title={!isOnline ? "You are offline" : "Create Folder"}
      >
        <FolderPlusIcon className="h-4 w-4" />
        <span className="hidden md:block">Create Folder </span>
      </Button>

      <InputDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Create New Folder"
        placeholder="Folder Name"
        confirmText="Create"
        confirmLoadingText="Creating..."
        onConfirm={(inputValue) => {
          guardMutation(() => {
            createFolderMutation.mutate({ folderName: inputValue });
          });
        }}
        isLoading={createFolderMutation.isPending}
        validate={(value) => value.trim().length > 0}
      />
    </>
  );
};
export default CreateFolder;

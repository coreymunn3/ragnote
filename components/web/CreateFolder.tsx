"use client";
import { useCreateFolder } from "@/hooks/folder/useCreateFolder";
import { Button } from "../ui/button";
import { FolderPlusIcon } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import InputDialog from "@/components/dialogs/InputDialog";

const CreateFolder = () => {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const createFolderMutation = useCreateFolder((folder) => {
    // Close dialog on successful folder creation
    setDialogOpen(false);
    // route user to new folder
    router.push(`/folder/${folder.id}`);
  });

  return (
    <>
      <Button
        variant={"ghost"}
        className="w-full flex justify-start h-[44px] hover:bg-primary/20 transition-colors duration-200"
        disabled={createFolderMutation.isPending}
        onClick={() => setDialogOpen(true)}
      >
        <FolderPlusIcon className="h-4 w-4" />
        Create Folder
      </Button>

      <InputDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Create New Folder"
        placeholder="Folder Name"
        confirmText="Create"
        confirmLoadingText="Creating..."
        onConfirm={(inputValue) => {
          createFolderMutation.mutate({ folderName: inputValue });
        }}
        isLoading={createFolderMutation.isPending}
        validate={(value) => value.trim().length > 0}
      />
    </>
  );
};
export default CreateFolder;

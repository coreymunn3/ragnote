"use client";
import { useCreateFolder } from "@/hooks/folder/useCreateFolder";
import { Button } from "../ui/button";
import { FolderPlusIcon } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DialogClose } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";

const CreateFolder = () => {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>("");

  const createFolderMutation = useCreateFolder((folder) => {
    // Clear input and close dialog on successful folder creation
    setFolderName("");
    setDialogOpen(false);
    // route user to new folder
    router.push(`/folder/${folder.id}`);
  });

  const handleCreateFolder = (folderName: string) => {
    createFolderMutation.mutate({ folderName });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"ghost"}
          className="w-full flex justify-start h-[44px] hover:bg-primary/20 transition-colors duration-200"
          disabled={createFolderMutation.isPending}
        >
          <FolderPlusIcon className="h-4 w-4" />
          Create Folder
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>Give your new folder a name</DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Folder Name"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"ghost"}>Cancel</Button>
          </DialogClose>
          <Button
            onClick={() => handleCreateFolder(folderName)}
            disabled={!folderName || createFolderMutation.isPending}
          >
            {createFolderMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default CreateFolder;

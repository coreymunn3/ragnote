"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { FilePlus2Icon } from "lucide-react";
import { useCreateNote } from "@/hooks/note/useCreateNote";
import { useOfflineGuard } from "@/hooks/useOfflineGuard";

interface CreateNoteProps {
  classname?: string;
  folderId: string;
}

const CreateNote = ({ classname, folderId }: CreateNoteProps) => {
  const router = useRouter();
  const { isOnline, guardMutation } = useOfflineGuard();
  const createNote = useCreateNote({
    // navigate the user to the new note's page
    onSuccess: (data, variables, context) => {
      router.push(`/note/${data.id}`);
    },
  });

  const handleCreateNote = () => {
    guardMutation(() => {
      // run mutation
      createNote.mutate({ title: "Untitled", folderId });
    });
  };

  return (
    <>
      <Button
        variant={"ghost"}
        onClick={handleCreateNote}
        className={classname}
        disabled={!isOnline}
        title={!isOnline ? "You are offline" : "New Note"}
      >
        <FilePlus2Icon className="h-4 w-4" />
      </Button>
    </>
  );
};
export default CreateNote;

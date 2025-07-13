"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { FilePlus2Icon } from "lucide-react";
import { useCreateNote } from "@/hooks/note/useCreateNote";

interface CreateNoteProps {
  classname?: string;
  folderId: string;
}

const CreateNote = ({ classname, folderId }: CreateNoteProps) => {
  const router = useRouter();
  const createNote = useCreateNote();

  const handleCreateNote = () => {
    // run mutation
    createNote.mutate({ title: "Untitled", folderId });
    // push user to new note page
  };

  return (
    <>
      <Button
        variant={"ghost"}
        onClick={handleCreateNote}
        className={classname}
      >
        <FilePlus2Icon className="h-4 w-4" />
      </Button>
    </>
  );
};
export default CreateNote;

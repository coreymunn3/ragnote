"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { FilePlus2Icon } from "lucide-react";

const CreateNote = ({ classname }: { classname?: string }) => {
  const router = useRouter();

  const handleCreateNote = () => {
    console.log("new note");
    // run mutation
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

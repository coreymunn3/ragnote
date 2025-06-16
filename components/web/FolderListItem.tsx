import { Note } from "@/lib/types/noteTypes";
import { Button } from "../ui/button";
import Link from "next/link";
import { FileIcon } from "lucide-react";

interface FolderListItemProps {
  note: Note;
}

const FolderListItem = ({ note }: FolderListItemProps) => {
  return (
    <Button
      variant={"ghost"}
      className="flex justify-start p-0 hover:bg-primary/20"
      asChild
    >
      <Link href={`/note/${note.id}/version/${note.current_version.id}`}>
        <FileIcon className="h-4 w-4" />
        <p>{note.title}</p>
      </Link>
    </Button>
  );
};
export default FolderListItem;

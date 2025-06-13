"use client";
import { Folder, Note } from "@/lib/types";
import { ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import NoteItem from "./NoteItem";
import { AnimatedExpandable, AnimatedListItem } from "@/components/animations";

interface FolderItemProps {
  folder: Folder;
  Icon: React.ReactNode;
  showCount?: boolean;
}

const FolderItem = ({ folder, Icon, showCount = true }: FolderItemProps) => {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => {
    setOpen(!open);
  };

  return (
    <div
      className={`p-1 rounded-[1.5rem] ${
        open
          ? "bg-gradient-to-br from-primary/20 to-sidebar dark:from-sidebar-accent-foreground/30 dark:to-sidebar"
          : ""
      } hover:bg-primary/20 dark:hover:bg-sidebar-accent-foreground/20 transition-colors duration-200`}
      onClick={toggleOpen}
    >
      <Button
        className="p-2 flex justify-between items-center w-full hover:bg-transparent dark:hover:bg-transparent"
        variant={"ghost"}
      >
        {/* Folder Name and Icon */}
        <div className="flex items-center space-x-2">
          {Icon}
          <span>{`${folder.folder_name} ${showCount ? `(${folder.notes.length})` : ""} `}</span>
        </div>
        {/* Expand Icon */}
        {folder.notes.length > 0 && (
          <div>
            <ChevronRightIcon
              className={`h-4 w-4 transition-transform duration-200 ${open && "rotate-90"}`}
            />
          </div>
        )}
      </Button>
      <AnimatedExpandable isOpen={open}>
        <div className="p-1 flex flex-col space-y-1">
          {folder.notes.map((note: Note, index) => (
            <AnimatedListItem key={note.id} index={index}>
              <NoteItem note={note} />
            </AnimatedListItem>
          ))}
        </div>
      </AnimatedExpandable>
    </div>
  );
};
export default FolderItem;

"use client";
import { Folder } from "@/lib/types/folderTypes";
import { Note } from "@/lib/types/noteTypes";
import { ChevronRightIcon, FilePlus2Icon } from "lucide-react";
import { Button } from "../ui/button";
import FolderListItem from "./FolderListItem";
import { AnimatedExpandable, AnimatedListItem } from "@/components/animations";
import Link from "next/link";

interface FolderItemProps {
  folder: Folder;
  Icon: React.ReactNode;
  showCount?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  showCreateFile?: boolean;
}

const FolderItem = ({
  folder: { id, folder_name, link, notes },
  Icon,
  showCount = true,
  isOpen = false,
  onToggle,
  showCreateFile = true,
}: FolderItemProps) => {
  const containsNotes = notes.length > 0;

  const toggleOpen = () => {
    if (containsNotes && onToggle) onToggle();
  };

  return (
    <div
      className={`p-1 rounded-md ${
        isOpen ? "bg-primary/20" : ""
      } hover:bg-primary/20 transition-colors duration-200`}
      onClick={toggleOpen}
    >
      <Button
        className="p-2 flex justify-between items-center w-full hover:bg-transparent dark:hover:bg-transparent"
        variant={"ghost"}
        asChild
      >
        <Link href={link}>
          {/* Folder Name and Icon */}
          <div className="flex items-center space-x-2">
            {Icon}
            <span>{`${folder_name} ${showCount ? `(${notes.length})` : ""} `}</span>
          </div>
          <div className="flex items-center space-x-1">
            {showCreateFile && (
              <div>
                <Button variant={"ghost"} className="hover:bg-transparent">
                  <FilePlus2Icon className="h-4 w-4" />
                </Button>
              </div>
            )}
            {/* Expand Icon */}
            <div>
              {containsNotes ? (
                <ChevronRightIcon
                  className={`h-4 w-4 transition-transform duration-200 ${isOpen && "rotate-90"}`}
                />
              ) : (
                <div className="h-4 w-4"></div>
              )}
            </div>
          </div>
        </Link>
      </Button>
      <AnimatedExpandable isOpen={isOpen}>
        <div className="p-1 flex flex-col space-y-1">
          {notes.map((note: Note, index) => (
            <AnimatedListItem
              key={note.id}
              index={index}
              animation="fadeInRight"
            >
              <FolderListItem note={note} />
            </AnimatedListItem>
          ))}
        </div>
      </AnimatedExpandable>
    </div>
  );
};
export default FolderItem;

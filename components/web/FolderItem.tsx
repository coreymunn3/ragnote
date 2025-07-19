"use client";
import { FolderWithNotes } from "@/lib/types/folderTypes";
import { Note } from "@/lib/types/noteTypes";
import { ChevronRightIcon, FilePlus2Icon } from "lucide-react";
import { Button } from "../ui/button";
import FolderListItem from "./FolderListItem";
import { AnimatedExpandable, AnimatedListItem } from "@/components/animations";
import Link from "next/link";
import CreateNote from "../CreateNote";

interface FolderItemProps {
  folder: FolderWithNotes;
  Icon: React.ReactNode;
  showCount?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  allowCreateNote?: boolean;
}

const FolderItem = ({
  folder: { id: folderId, folder_name, href, notes },
  Icon,
  showCount = true,
  isOpen = false,
  onToggle,
  allowCreateNote,
}: FolderItemProps) => {
  const containsNotes = notes.length > 0;

  // This will toggle the folder open when clicking the folder area,
  // but won't toggle it closed when clicking again (navigation only)
  const handleFolderClick = () => {
    // Only toggle to open if it's not already open
    // No toggling to close - this lets the folder stay open when navigating
    if (!isOpen && containsNotes && onToggle) {
      onToggle();
    }
  };

  // Separate handler for chevron click that toggles both ways
  const handleToggleFolderOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Always toggle regardless of current state
    if (onToggle) onToggle();
  };

  return (
    <div
      className={`p-1 rounded-md ${
        isOpen ? "bg-primary/20" : ""
      } hover:bg-primary/20 transition-colors duration-200`}
      onClick={handleFolderClick}
    >
      <div className="flex items-center">
        <Button
          className="p-2 flex-grow flex justify-between items-center hover:bg-transparent dark:hover:bg-transparent"
          variant={"ghost"}
          asChild
        >
          <Link href={href}>
            {/* Folder Name and Icon */}
            <div className="flex items-center space-x-2">
              {Icon}
              <span>{`${folder_name} ${showCount ? `(${notes.length})` : ""} `}</span>
            </div>
            <div className="flex items-center space-x-1">
              {allowCreateNote && (
                <div>
                  <CreateNote
                    classname="hover:bg-transparent"
                    folderId={folderId}
                  />
                </div>
              )}
            </div>
          </Link>
        </Button>

        {/* Expand Icon - Completely outside Link to prevent navigation */}
        {containsNotes ? (
          <div className="p-2 cursor-pointer" onClick={handleToggleFolderOpen}>
            <ChevronRightIcon
              className={`h-4 w-4 transition-transform duration-200 ${isOpen && "rotate-90"}`}
            />
          </div>
        ) : (
          <div className="p-2 w-8"></div>
        )}
      </div>
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

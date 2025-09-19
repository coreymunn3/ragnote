"use client";
import { FolderWithItems } from "@/lib/types/folderTypes";
import { Note } from "@/lib/types/noteTypes";
import { ChevronRightIcon, FilePlus2Icon } from "lucide-react";
import { Button } from "../ui/button";
import FolderItemRenderer from "./FolderItemRenderer";
import { AnimatedExpandable, AnimatedListItem } from "@/components/animations";
import Link from "next/link";
import CreateNote from "../CreateNote";
import { ChatSession } from "@/lib/types/chatTypes";

interface FolderListItemProps {
  folder: FolderWithItems;
  Icon: React.ReactNode;
  showCount?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  allowCreateNote?: boolean;
}

const FolderListItem = ({
  folder: { id: folderId, folder_name, href, items, itemType },
  Icon,
  showCount = true,
  isOpen = false,
  onToggle,
  allowCreateNote,
}: FolderListItemProps) => {
  const containsNotes = items.length > 0;

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
              <span>{`${folder_name} ${showCount ? `(${items.length})` : ""} `}</span>
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
          {items.map((item: Note | ChatSession, index: number) => {
            const routePrefix = itemType === "note" ? "/note" : "/chat";

            return (
              <AnimatedListItem
                key={item.id}
                index={index}
                animation="fadeInRight"
              >
                <FolderItemRenderer item={item} routePrefix={routePrefix} />
              </AnimatedListItem>
            );
          })}
        </div>
      </AnimatedExpandable>
    </div>
  );
};
export default FolderListItem;

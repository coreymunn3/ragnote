"use client";

import { FolderWithItems } from "@/lib/types/folderTypes";
import { TypographyP } from "../ui/typography";
import { ChevronRightIcon } from "lucide-react";

interface MobileListItemFolderDetailProps {
  folder: FolderWithItems;
  isOpen?: boolean;
  onToggle?: () => void;
}

const MobileListItemFolderDetail = ({
  folder,
  isOpen = false,
  onToggle,
}: MobileListItemFolderDetailProps) => {
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onToggle) {
      onToggle();
    }
  };

  return (
    <>
      <TypographyP>{folder.items.length}</TypographyP>
      <div onClick={handleToggle} className="cursor-pointer p-2 -m-2">
        <ChevronRightIcon
          className={`h-4 w-4 transition-transform duration-200 ${isOpen && "rotate-90"}`}
        />
      </div>
    </>
  );
};
export default MobileListItemFolderDetail;

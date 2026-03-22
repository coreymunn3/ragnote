"use client";

import { FolderWithItems } from "@/lib/types/folderTypes";
import { TypographyP } from "../ui/typography";
import { ArchiveRestore, ChevronRightIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useUpdateFolder } from "@/hooks/folder/useUpdateFolder";

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
  const updateFolderMutation = useUpdateFolder();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onToggle) {
      onToggle();
    }
  };

  const handleRecover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    updateFolderMutation.mutate({
      folderId: folder.id,
      action: "recover",
    });
  };

  return (
    <>
      {folder.is_deleted ? (
        <Button variant={"ghost"} onClick={handleRecover}>
          <ArchiveRestore className="h-4 w-4" />
        </Button>
      ) : (
        <>
          <TypographyP>{folder.items.length}</TypographyP>
          <div onClick={handleToggle} className="cursor-pointer p-2 -m-2">
            <ChevronRightIcon
              className={`h-4 w-4 transition-transform duration-200 ${isOpen && "rotate-90"}`}
            />
          </div>
        </>
      )}
    </>
  );
};
export default MobileListItemFolderDetail;

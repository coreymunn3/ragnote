"use client";

import { FolderWithItems } from "@/lib/types/folderTypes";
import { TypographyP } from "../ui/typography";
import { ChevronRightIcon } from "lucide-react";

interface MobileListItemFolderDetailProps {
  folder: FolderWithItems;
}

const MobileListItemFolderDetail = ({
  folder,
}: MobileListItemFolderDetailProps) => {
  return (
    <>
      <TypographyP>{folder.items.length}</TypographyP>
      <ChevronRightIcon className="h-4 w-4" />
    </>
  );
};
export default MobileListItemFolderDetail;

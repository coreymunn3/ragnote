"use client";
import Link from "next/link";
import { Button } from "../ui/button";
import { getFolderIcon } from "@/lib/utils";
import { TypographyP } from "../ui/typography";
import { ChevronRight } from "lucide-react";
import { FolderWithItems } from "@/lib/types/folderTypes";

interface FolderListItemProps {
  folder: FolderWithItems;
  isLastFolder: boolean;
}

const FolderListItem = ({ folder, isLastFolder }: FolderListItemProps) => {
  return (
    <div>
      <Button variant={"ghost"} className="w-full" asChild>
        <Link href={folder.href}>
          {/* folder Name and Icon */}
          <div className="w-full flex items-center justify-between">
            {/* left side - icon and name */}
            <div className="flex items-center space-x-2">
              {getFolderIcon(folder.id)}
              <span>{folder.folder_name}</span>
            </div>
            {/* right side - count and arrow */}
            <div className="flex items-center space-x-2 text-muted-foreground">
              <TypographyP>{folder.items.length}</TypographyP>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </Link>
      </Button>
      {isLastFolder && <hr className="border-sidebar-border"></hr>}
    </div>
  );
};
export default FolderListItem;

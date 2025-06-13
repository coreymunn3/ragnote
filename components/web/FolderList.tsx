"use client";
import { Folder } from "@/lib/types";
import { SidebarMenu, SidebarMenuItem } from "../ui/sidebar";
import {
  FolderIcon,
  FolderSyncIcon,
  HouseIcon,
  Trash2Icon,
} from "lucide-react";
import FolderItem from "./FolderItem";
import { AnimatedListItem } from "@/components/animations";

interface FolderListProps {
  folders: Folder[];
  recentlyDeleted?: Folder;
  shared?: Folder;
  showCount?: boolean;
}

const FolderList = ({
  folders,
  shared,
  recentlyDeleted,
  showCount,
}: FolderListProps) => {
  const allFolders = [
    ...folders,
    ...(shared ? [shared] : []),
    ...(recentlyDeleted ? [recentlyDeleted] : []),
  ];

  const getFolderIcon = (folderName: string) => {
    switch (folderName) {
      case "Recently Deleted":
        return <Trash2Icon className="h-4 w-4" />;
      case "Shared With You":
        return <FolderSyncIcon className="h-4 w-4" />;
      case "Home":
        return <HouseIcon className="h-4 w-4" />;
      default:
        return <FolderIcon className="h-4 w-4" />;
    }
  };

  return (
    <SidebarMenu>
      {allFolders.map((folder: Folder, index) => (
        <SidebarMenuItem key={folder.id}>
          <AnimatedListItem index={index}>
            <FolderItem
              folder={folder}
              Icon={getFolderIcon(folder.folder_name)}
              showCount={showCount}
            />
          </AnimatedListItem>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};
export default FolderList;

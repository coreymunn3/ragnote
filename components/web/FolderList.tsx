"use client";
import { Folder } from "@/lib/types";
import { SidebarMenu, SidebarMenuItem } from "../ui/sidebar";
import { FolderIcon, FolderSyncIcon, Trash2Icon } from "lucide-react";
import FolderItem from "./FolderItem";
import { AnimatedListItem } from "@/components/animations";

interface FolderListProps {
  folders: Folder[];
  recentlyDeleted: Folder;
  shared: Folder;
}

const FolderList = ({ folders, shared, recentlyDeleted }: FolderListProps) => {
  const allFolders = [...folders, shared, recentlyDeleted];

  const getFolderIcon = (folderName: string) => {
    switch (folderName) {
      case "Recently Deleted":
        return <Trash2Icon className="h-4 w-4" />;
      case "Shared With You":
        return <FolderSyncIcon className="h-4 w-4" />;
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
            />
          </AnimatedListItem>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};
export default FolderList;

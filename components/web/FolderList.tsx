"use client";
import { Folder } from "@/lib/types";
import { SidebarMenu, SidebarMenuItem } from "../ui/sidebar";
import { FolderIcon, Trash2Icon } from "lucide-react";
import FolderItem from "./FolderItem";
import { AnimatedListItem } from "@/components/animations";

interface FolderListProps {
  folders: Folder[];
  recentlyDeleted: Folder;
}

const FolderList = ({ folders, recentlyDeleted }: FolderListProps) => {
  const allFolders = [...folders, recentlyDeleted];

  return (
    <SidebarMenu>
      {allFolders.map((folder: Folder, index) => (
        <SidebarMenuItem key={folder.id}>
          <AnimatedListItem index={index}>
            <FolderItem
              folder={folder}
              Icon={
                folder.folder_name === "Recently Deleted" ? (
                  <Trash2Icon className="h-4 w-4" />
                ) : (
                  <FolderIcon className="h-4 w-4" />
                )
              }
            />
          </AnimatedListItem>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};
export default FolderList;

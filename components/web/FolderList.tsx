"use client";
import { Folder } from "@/lib/types/folderTypes";
import { SidebarMenu, SidebarMenuItem } from "../ui/sidebar";
import {
  FolderIcon,
  FolderSyncIcon,
  HouseIcon,
  Trash2Icon,
} from "lucide-react";
import FolderItem from "./FolderItem";
import { AnimatedListItem } from "@/components/animations";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface FolderListProps {
  folders: Folder[];
  recentlyDeleted?: Folder;
  shared?: Folder;
  showCount?: boolean;
  showCreateFile?: boolean;
}

const FolderList = ({
  folders,
  shared,
  recentlyDeleted,
  showCount,
  showCreateFile,
}: FolderListProps) => {
  const pathname = usePathname();
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);

  // Close all folders when on the dashboard route
  useEffect(() => {
    if (pathname === "/dashboard") {
      setOpenFolderId(null);
    }
  }, [pathname]);

  const toggleFolder = (folderId: string) => {
    setOpenFolderId((current) => (current === folderId ? null : folderId));
  };
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
          <AnimatedListItem index={index} animation="fadeInRight">
            <FolderItem
              folder={folder}
              Icon={getFolderIcon(folder.folder_name)}
              showCount={showCount}
              isOpen={openFolderId === folder.id}
              onToggle={() => toggleFolder(folder.id)}
              showCreateFile={showCreateFile}
            />
          </AnimatedListItem>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};
export default FolderList;

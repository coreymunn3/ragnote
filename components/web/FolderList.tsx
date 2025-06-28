"use client";
import { FolderWithNotes } from "@/lib/types/folderTypes";
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
import { Skeleton } from "@/components/ui/skeleton";

interface FolderListProps {
  folders: FolderWithNotes[] | undefined;
  isLoading?: boolean;
  showCount?: boolean;
  showCreateFile?: boolean;
}

const FolderList = ({
  folders,
  isLoading = false,
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

  // show a folder Icon for system folders and home
  const getFolderIcon = (folderId: string) => {
    switch (folderId) {
      case "system:deleted":
        return <Trash2Icon className="h-4 w-4" />;
      case "system:shared":
        return <FolderSyncIcon className="h-4 w-4" />;
      case "home":
        return <HouseIcon className="h-4 w-4" />;
      default:
        return <FolderIcon className="h-4 w-4" />;
    }
  };

  // skeletons when loading
  const renderFolderSkeletons = () => {
    return Array.from({ length: 3 }).map((_, index) => (
      <SidebarMenuItem key={`skeleton-${index}`}>
        <AnimatedListItem index={index} animation="fadeInRight">
          <div className="flex items-center gap-2 p-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 flex-1 rounded" />
          </div>
        </AnimatedListItem>
      </SidebarMenuItem>
    ));
  };

  if (isLoading) {
    return <SidebarMenu>{renderFolderSkeletons()}</SidebarMenu>;
  }

  return (
    <SidebarMenu>
      {folders &&
        folders.map((folder: FolderWithNotes, index) => (
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

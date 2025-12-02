"use client";
import { FolderWithItems } from "@/lib/types/folderTypes";
import { SidebarMenu, SidebarMenuItem } from "../ui/sidebar";
import FolderListItem from "./FolderListItem";
import { AnimatedListItem } from "@/components/animations";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import CreateFolder from "../CreateFolder";
import { getFolderIcon } from "@/lib/utils";
import FolderListSkeleton from "../skeletons/FolderListSkeleton";

interface FolderListProps {
  folders: FolderWithItems[] | undefined;
  isLoading?: boolean;
  showCount?: boolean;
  allowCreateNote?: boolean;
  allowCreateFolder?: boolean;
}

const FolderList = ({
  folders,
  isLoading = false,
  showCount,
  allowCreateNote,
  allowCreateFolder,
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

  if (isLoading) {
    return <FolderListSkeleton />;
  }

  return (
    <SidebarMenu>
      {folders &&
        folders.map((folder: FolderWithItems, index) => (
          <SidebarMenuItem key={folder.id}>
            <AnimatedListItem index={index} animation="fadeInRight">
              <FolderListItem
                folder={folder}
                Icon={getFolderIcon(folder.id)}
                showCount={showCount}
                isOpen={openFolderId === folder.id}
                onToggle={() => toggleFolder(folder.id)}
                allowCreateNote={allowCreateNote}
              />
            </AnimatedListItem>
          </SidebarMenuItem>
        ))}
      {allowCreateFolder && (
        <AnimatedListItem index={folders?.length || 0} animation="fadeInRight">
          <CreateFolder />
        </AnimatedListItem>
      )}
    </SidebarMenu>
  );
};
export default FolderList;

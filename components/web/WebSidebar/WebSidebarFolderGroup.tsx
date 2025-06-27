import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import FolderList from "../FolderList";
import { FolderWithNotes } from "@/lib/types/folderTypes";

interface WebSidebarFolderGroupProps {
  folders: FolderWithNotes[];
  isLoading?: boolean;
  groupName: string;
  showCount?: boolean;
  showCreateFile?: boolean;
  recentlyDeleted?: FolderWithNotes;
  shared?: FolderWithNotes;
}

const WebSidebarFolderGroup = ({
  folders,
  isLoading = false,
  groupName,
  showCount,
  showCreateFile,
  recentlyDeleted,
  shared,
}: WebSidebarFolderGroupProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{groupName}</SidebarGroupLabel>
      <SidebarGroupContent>
        <FolderList
          folders={folders}
          isLoading={isLoading}
          showCount={showCount}
          showCreateFile={showCreateFile}
          recentlyDeleted={recentlyDeleted}
          shared={shared}
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
export default WebSidebarFolderGroup;

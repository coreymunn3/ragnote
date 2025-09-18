import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import FolderList from "../FolderList";
import { FolderWithItems } from "@/lib/types/folderTypes";

interface WebSidebarFolderGroupProps {
  folders: FolderWithItems[] | undefined;
  isLoading?: boolean;
  groupName: string;
  showCount?: boolean;
  allowCreateNote?: boolean;
  allowCreateFolder?: boolean;
}

const WebSidebarFolderGroup = ({
  folders,
  isLoading = false,
  groupName,
  showCount,
  allowCreateNote,
  allowCreateFolder,
}: WebSidebarFolderGroupProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{groupName}</SidebarGroupLabel>
      <SidebarGroupContent>
        <FolderList
          folders={folders}
          isLoading={isLoading}
          showCount={showCount}
          allowCreateNote={allowCreateNote}
          allowCreateFolder={allowCreateFolder}
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
export default WebSidebarFolderGroup;

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import FolderList from "../FolderList";
import { FolderWithNotes } from "@/lib/types/folderTypes";

interface WebSidebarFolderGroupProps {
  folders: FolderWithNotes[] | undefined;
  isLoading?: boolean;
  groupName: string;
  showCount?: boolean;
  allowCreateNote?: boolean;
}

const WebSidebarFolderGroup = ({
  folders,
  isLoading = false,
  groupName,
  showCount,
  allowCreateNote,
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
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
export default WebSidebarFolderGroup;

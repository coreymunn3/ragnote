import { Folder } from "@/lib/types";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "../ui/sidebar";
import { FolderIcon, ChevronRightIcon, Trash2Icon } from "lucide-react";
import FolderItem from "./FolderItem";

interface FolderListProps {
  folders: Folder[];
  recentlyDeleted: Folder;
}

const FolderList = ({ folders, recentlyDeleted }: FolderListProps) => {
  return (
    <SidebarMenu>
      {folders.map((folder: Folder) => (
        <SidebarMenuItem key={folder.id}>
          <FolderItem
            folder={folder}
            Icon={<FolderIcon className="h-4 w-4" />}
          />
        </SidebarMenuItem>
      ))}
      {recentlyDeleted && (
        <SidebarMenuItem key={recentlyDeleted.id}>
          <FolderItem
            folder={recentlyDeleted}
            Icon={<Trash2Icon className="h-4 w-4" />}
          />
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  );
};
export default FolderList;

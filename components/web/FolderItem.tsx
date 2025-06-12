import { Folder } from "@/lib/types";
import { SidebarMenuButton } from "../ui/sidebar";
import { FolderIcon, ChevronRightIcon } from "lucide-react";

interface FolderItemProps {
  folder: Folder;
  Icon: React.ReactNode;
}

const FolderItem = ({ folder, Icon }: FolderItemProps) => {
  return (
    <SidebarMenuButton className="flex justify-between items-center">
      {/* Folder Name and Icon */}
      <div className="flex items-center space-x-2">
        {Icon}
        <span>{`${folder.folder_name} (${folder.notes.length})`}</span>
      </div>
      {/* Expand Icon */}
      <div>
        <ChevronRightIcon className="h-4 w-4 opacity-30 hover:opacity-100" />
      </div>
    </SidebarMenuButton>
  );
};
export default FolderItem;

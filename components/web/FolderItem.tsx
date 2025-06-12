"use client";
import { Folder } from "@/lib/types";
import { SidebarMenuButton } from "../ui/sidebar";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";

interface FolderItemProps {
  folder: Folder;
  Icon: React.ReactNode;
}

const FolderItem = ({ folder, Icon }: FolderItemProps) => {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => {
    setOpen(!open);
  };

  return (
    <div className={` p-1 rounded-[1.5rem]`} onClick={toggleOpen}>
      <SidebarMenuButton className="flex justify-between items-center">
        {/* Folder Name and Icon */}
        <div className="flex items-center space-x-2">
          {Icon}
          <span>{`${folder.folder_name} (${folder.notes.length})`}</span>
        </div>
        {/* Expand Icon */}
        <div>
          <ChevronRightIcon
            className={`h-4 w-4 transition-transform duration-200 ${open && "rotate-90"}`}
          />
        </div>
      </SidebarMenuButton>
      {open && <div className={`p-2`}>Test</div>}
    </div>
  );
};
export default FolderItem;

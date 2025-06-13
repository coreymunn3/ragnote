"use client";
import { Folder } from "@/lib/types";
import { SidebarMenu, SidebarMenuItem } from "../ui/sidebar";
import { FolderIcon, Trash2Icon } from "lucide-react";
import FolderItem from "./FolderItem";
import { AnimatePresence, motion } from "framer-motion";

interface FolderListProps {
  folders: Folder[];
  recentlyDeleted: Folder;
}

const FolderList = ({ folders, recentlyDeleted }: FolderListProps) => {
  const allFolders = [...folders, recentlyDeleted];
  return (
    <AnimatePresence>
      <SidebarMenu>
        {allFolders.map((folder: Folder, index) => (
          <motion.div
            key={folder.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
              delay: index * 0.1,
            }}
          >
            <SidebarMenuItem>
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
            </SidebarMenuItem>
          </motion.div>
        ))}
      </SidebarMenu>
    </AnimatePresence>
  );
};
export default FolderList;

"use client";
import FolderList from "@/components/mobile/FolderList";
import IntegratedSearch from "@/components/search/IntegratedSearch";
import { useGetFolders } from "@/hooks/folder/useGetFolders";
import { ChatSession } from "@/lib/types/chatTypes";
import { FolderWithItems } from "@/lib/types/folderTypes";
import { Note } from "@/lib/types/noteTypes";

interface MobileDashboardContentProps {
  userFolders: FolderWithItems[];
  systemFolders: FolderWithItems[];
}

const MobileDashboardContent = ({
  userFolders,
  systemFolders,
}: MobileDashboardContentProps) => {
  // immediately re-fetch the user's folders
  const folders = useGetFolders({
    initialData: {
      user: userFolders,
      system: systemFolders,
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  return (
    <div className="flex flex-col space-y-4">
      <IntegratedSearch />
      <FolderList title="Your Folders" folders={folders.data!.user} />
      <FolderList title="System Folders" folders={folders.data!.system} />
    </div>
  );
};
export default MobileDashboardContent;

"use client";
import MobileList from "@/components/mobile/MobileList";
import IntegratedSearch from "@/components/search/IntegratedSearch";
import { useGetFolders } from "@/hooks/folder/useGetFolders";
import { FolderWithItems } from "@/lib/types/folderTypes";

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
      <MobileList
        title="Your Folders"
        items={folders.data?.user}
        type="folder"
        isLoading={folders.isLoading}
      />
      <MobileList
        title="System Folders"
        items={folders.data?.system}
        type="folder"
        isLoading={folders.isLoading}
      />
    </div>
  );
};
export default MobileDashboardContent;

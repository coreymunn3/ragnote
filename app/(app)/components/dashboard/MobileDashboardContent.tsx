"use client";
import CreateFolder from "@/components/CreateFolder";
import MobileList from "@/components/mobile/MobileList";
import IntegratedSearch from "@/components/search/IntegratedSearch";
import { useGetFolders } from "@/hooks/folder/useGetFolders";
import { FolderWithItems } from "@/lib/types/folderTypes";
import { FolderPlusIcon } from "lucide-react";

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
        action={<CreateFolder />}
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

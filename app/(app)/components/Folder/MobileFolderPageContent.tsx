"use client";

import MobileList from "@/components/mobile/MobileList";
import { useGetFolderById } from "@/hooks/folder/useGetFolderById";
import { FolderWithItems } from "@/lib/types/folderTypes";

interface MobileFolderPageContentProps {
  folder: FolderWithItems;
}

const MobileFolderPageContent = ({ folder }: MobileFolderPageContentProps) => {
  // get the folder data
  const folderData = useGetFolderById(folder.id, {
    initialData: folder,
    staleTime: 0,
    refetchOnMount: true,
  });

  return (
    <div>
      <MobileList
        type={folderData.data!.itemType}
        items={folderData.data!.items}
        title={folder.folder_name}
      />
    </div>
  );
};
export default MobileFolderPageContent;

"use client";
import { useEffect } from "react";
import CreateFolder from "@/components/CreateFolder";
import MobileList from "@/components/mobile/MobileList";
import IntegratedSearch from "@/components/search/IntegratedSearch";
import { useGetFolders } from "@/hooks/folder/useGetFolders";
import { FolderWithItems } from "@/lib/types/folderTypes";
import { useMobileHeader } from "@/contexts/MobileHeaderContext";
import BrandingHeader from "@/components/BrandingHeader";

interface MobileDashboardContentProps {
  userFolders: FolderWithItems[];
  systemFolders: FolderWithItems[];
}

const MobileDashboardContent = ({
  userFolders,
  systemFolders,
}: MobileDashboardContentProps) => {
  const { setHeaderConfig, resetHeaderConfig } = useMobileHeader();
  // Set header configuration for Dashboard
  useEffect(() => {
    setHeaderConfig({
      leftContent: <BrandingHeader />,
      rightContent: null, // UserButton is always shown
    });

    return () => {
      resetHeaderConfig();
    };
  }, [setHeaderConfig, resetHeaderConfig]);

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

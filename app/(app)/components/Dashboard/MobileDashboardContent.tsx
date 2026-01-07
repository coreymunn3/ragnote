"use client";
import { useEffect } from "react";
import CreateFolder from "@/components/CreateFolder";
import MobileList, { SystemLinkItem } from "@/components/mobile/MobileList";
import IntegratedSearch from "@/components/search/IntegratedSearch";
import { useGetFolders } from "@/hooks/folder/useGetFolders";
import { FolderWithItems } from "@/lib/types/folderTypes";
import { useMobileHeader } from "@/contexts/MobileHeaderContext";
import BrandingHeader from "@/components/BrandingHeader";
import { MessageSquareIcon, Trash2Icon } from "lucide-react";

interface MobileDashboardContentProps {
  userFolders: FolderWithItems[];
}

const MobileDashboardContent = ({
  userFolders,
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
    initialData: userFolders,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Define system links
  const systemLinks: SystemLinkItem[] = [
    {
      id: "chats-link",
      href: "/chats",
      icon: MessageSquareIcon,
      label: "Chats",
    },
    {
      id: "recently-deleted-link",
      href: "/recently-deleted",
      icon: Trash2Icon,
      label: "Recently Deleted",
    },
  ];

  return (
    <div className="flex flex-col space-y-4">
      <IntegratedSearch />
      <MobileList
        title="Your Folders"
        items={folders.data}
        type="folder"
        isLoading={folders.isLoading}
        action={<CreateFolder />}
        emptyContentMessage="No folders yet. Create a folder to get started."
      />
      <MobileList title="System" items={systemLinks} type="link" />
    </div>
  );
};
export default MobileDashboardContent;

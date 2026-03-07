"use client";
import CreateFolder from "@/components/CreateFolder";
import MobileList, { SystemLinkItem } from "@/components/mobile/MobileList";
import CommandBar from "@/components/commandbar/CommandBar";
import { useGetFolders } from "@/hooks/folder/useGetFolders";
import { FolderWithItems } from "@/lib/types/folderTypes";
import { MessageSquareIcon, Trash2Icon } from "lucide-react";

interface MobileDashboardContentProps {
  userFolders: FolderWithItems[];
}

const MobileDashboardContent = ({
  userFolders,
}: MobileDashboardContentProps) => {
  // immediately re-fetch the user's folders
  const folders = useGetFolders({
    placeholderData: userFolders,
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
      <CommandBar scope="global" />
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

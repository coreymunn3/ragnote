"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import WebSidebarInternalTrigger from "./WebSidebarInternalTrigger";
import BrandingHeader from "@/components/BrandingHeader";
import { SignedIn, useUser } from "@clerk/nextjs";
import UserButtonCustom from "@/components/UserButtonCustom";
import WebSidebarFolderGroup from "./WebSidebarFolderGroup";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useGetFolders } from "@/hooks/folder/useGetFolders";
import { MessageSquareIcon, Trash2Icon, TrashIcon } from "lucide-react";
import WebSidebarLinkGroup from "./WebSidebarLinkGroup";

const WebSidebar = () => {
  const { user } = useUser();
  const folders = useGetFolders();
  const isOnline = useOnlineStatus();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex justify-between items-center">
          {/* User Button */}
          <SignedIn>
            <div
              className={`flex items-center space-x-2 ${!isOnline ? "pointer-events-none opacity-80" : ""}`}
            >
              <UserButtonCustom />
              <div className="flex flex-col">
                <p className="text-sm font-semibold">
                  {user?.fullName || user?.firstName || "User"}
                </p>
                {user?.primaryEmailAddress && (
                  <p className="text-xs text-muted-foreground">
                    {user.primaryEmailAddress.emailAddress}
                  </p>
                )}
              </div>
            </div>
          </SignedIn>
          {/* Additional Controls */}
          <div>
            {/* Collapse Sidebar */}
            <WebSidebarInternalTrigger />
          </div>
        </div>
      </SidebarHeader>
      {/* The Sidebar Content pane */}
      <SidebarContent className="p-2 relative h-full">
        {/* Home */}
        <WebSidebarFolderGroup
          groupName="Get Started"
          folders={[
            {
              id: "home",
              folder_name: "Home",
              href: "/dashboard",
              items: [],
              itemType: "note", // does not matter, no items to expand in this folder list
              user_id: "", // does not matter
              is_deleted: false, // does not matter
              created_at: new Date(), // does not matter
              updated_at: new Date(), // does not matter
            },
          ]}
          showCount={false}
        />
        {/* Your Folders */}
        <WebSidebarFolderGroup
          groupName="Your Folders"
          folders={folders.data}
          isLoading={folders.isLoading}
          allowCreateFolder={true}
          allowCreateNote={true}
        />
        {/* Special Views */}
        <WebSidebarLinkGroup
          groupName="System"
          links={[
            { href: "/chats", icon: MessageSquareIcon, label: "Chats" },
            {
              href: "/recently-deleted",
              icon: Trash2Icon,
              label: "Recently Deleted",
            },
          ]}
        />
        {/* A spacer */}
        <div className="min-h-[40px] w-full">d</div>
      </SidebarContent>
      <SidebarFooter className="absolute w-full z-10 bottom-0 left-0 right-0 bg-sidebar/25 backdrop-blur-sm">
        <BrandingHeader />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default WebSidebar;

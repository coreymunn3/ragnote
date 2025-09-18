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
import { SignedIn, UserButton, useUser } from "@clerk/nextjs";
import ThemeSwitch from "@/components/ThemeSwitch";
import WebSidebarFolderGroup from "./WebSidebarFolderGroup";
import { useGetFolders } from "@/hooks/folder/useGetFolders";

const WebSidebar = () => {
  const { user } = useUser();
  const folders = useGetFolders();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex justify-between items-center">
          {/* User Button */}
          <SignedIn>
            <div className="flex items-center space-x-2">
              <UserButton />
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
      <SidebarContent className="p-2">
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
          folders={folders.data?.user}
          isLoading={folders.isLoading}
          allowCreateFolder={true}
          allowCreateNote={true}
        />
        {/* system folders */}
        <WebSidebarFolderGroup
          groupName="System Folders"
          folders={folders.data?.system}
          isLoading={folders.isLoading}
        />
        {/*  TO DO - find out the best way to render conversations in a group
        Probably make another component, WebSidebarConversations
        */}
      </SidebarContent>
      <SidebarFooter>
        <ThemeSwitch />
        <BrandingHeader />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default WebSidebar;

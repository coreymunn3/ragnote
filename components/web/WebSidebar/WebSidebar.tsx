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
import CreateFolder from "../CreateFolder";
import WebSidebarFolderGroup from "./WebSidebarFolderGroup";
import { useGetUserFolders } from "@/hooks/folder/useGetUserFolders";

const WebSidebar = () => {
  const { user } = useUser();
  const folders = useGetUserFolders();

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
              notes: [],
              user_id: "",
              is_deleted: false,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ]}
          showCount={false}
          showCreateFile={false}
        />
        {/* Your Folders */}
        <WebSidebarFolderGroup
          groupName="Your Folders"
          folders={folders.data?.user}
          isLoading={folders.isLoading}
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
        <CreateFolder />
        <ThemeSwitch />
        <BrandingHeader />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default WebSidebar;

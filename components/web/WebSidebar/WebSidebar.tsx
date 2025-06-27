"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import WebSidebarInternalTrigger from "./WebSidebarInternalTrigger";
import BrandingHeader from "@/components/BrandingHeader";
import { SignedIn, UserButton, useUser } from "@clerk/nextjs";
import ThemeSwitch from "@/components/ThemeSwitch";
import CreateFolder from "../CreateFolder";
import WebSidebarFolderGroup from "./WebSidebarFolderGroup";
import { useGetFolders } from "@/hooks/folder/useGetFolders";

const WebSidebar = () => {
  const { user } = useUser();
  const userFolders = useGetFolders();

  // TO DO - get the users recently deleted folders from DB
  // we will create this folder manually, containing only notes with is_deleted of true
  const recentlyDeleted = {
    id: "11",
    folder_name: "Recently Deleted",
    href: `/folder/111`,
    user_id: "",
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    notes: [],
  };

  // TO DO - get the shared notes from db
  const shared = {
    id: "22",
    folder_name: "Shared With You",
    href: `/folder/222`,
    user_id: "",
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    notes: [],
  };

  // TO DO - get conversations from the db
  const conversations = [
    {
      id: "33",
      title: "What kind of questions can I ask you?",
      is_pinned: false,
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date(),
      messages_count: 4,
    },
    {
      id: "33",
      title: "Have you noticed any patterns in my grocery shopping?",
      is_pinned: false,
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date(),
      messages_count: 23,
    },
  ];

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
          folders={userFolders?.data}
          isLoading={userFolders.isLoading}
          shared={shared}
          recentlyDeleted={recentlyDeleted}
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

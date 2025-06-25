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
import { SignedIn, UserButton } from "@clerk/nextjs";
import FolderList from "@/components/web/FolderList";
import ThemeSwitch from "@/components/ThemeSwitch";
import { useCreateFolder } from "@/hooks/folder/useCreateFolder";
import CreateFolder from "../CreateFolder";

const WebSidebar = () => {
  const createFolderMutation = useCreateFolder();

  // TO DO - get the users folders from DB
  const userFolders = [
    {
      id: "1",
      folder_name: "All Notes",
      href: `/folder/1`,
      user_id: "",
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date(),
      notes: [
        {
          id: "1",
          title: "Trips I want to take in 2025",
          current_version: {
            id: "abcd",
            version_number: 7,
            is_published: true,
            published_at: new Date(),
          },
          is_pinned: false,
          is_deleted: false,
          created_at: new Date(),
          updated_at: new Date(),
          shared_with_count: 0,
        },
        {
          id: "2",
          title: "Beef Stew Recipe",
          current_version: {
            id: "abcd",
            version_number: 2,
            is_published: true,
            published_at: new Date(),
          },
          is_pinned: false,
          is_deleted: false,
          created_at: new Date(),
          updated_at: new Date(),
          shared_with_count: 0,
        },
        {
          id: "3",
          title: "Groceries",
          current_version: {
            id: "abcd",
            version_number: 4,
            is_published: false,
            published_at: null,
          },
          is_pinned: false,
          is_deleted: false,
          created_at: new Date(),
          updated_at: new Date(),
          shared_with_count: 0,
        },
        {
          id: "4",
          title: "2025 Summer Training Plans",
          current_version: {
            id: "abcd",
            version_number: 14,
            is_published: true,
            published_at: new Date(),
          },
          is_pinned: false,
          is_deleted: false,
          created_at: new Date(),
          updated_at: new Date(),
          shared_with_count: 0,
        },
      ],
    },
    {
      id: "2",
      folder_name: "Cooking",
      href: `/folder/2`,
      user_id: "",
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date(),
      notes: [
        {
          id: "2",
          title: "Beef Stew Recipe",
          current_version: {
            id: "abcd",
            version_number: 2,
            is_published: true,
            published_at: new Date(),
          },
          is_pinned: false,
          is_deleted: false,
          created_at: new Date(),
          updated_at: new Date(),
          shared_with_count: 0,
        },
        {
          id: "3",
          title: "Groceries",
          current_version: {
            id: "abcd",
            version_number: 4,
            is_published: false,
            published_at: null,
          },
          is_pinned: false,
          is_deleted: false,
          created_at: new Date(),
          updated_at: new Date(),
          shared_with_count: 0,
        },
      ],
    },
    {
      id: "3",
      folder_name: "Climbing",
      href: `/folder/3`,
      user_id: "",
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date(),
      notes: [
        {
          id: "4",
          title: "2025 Summer Training Plans",
          current_version: {
            id: "abcd",
            version_number: 14,
            is_published: true,
            published_at: new Date(),
          },
          is_pinned: false,
          is_deleted: false,
          created_at: new Date(),
          updated_at: new Date(),
          shared_with_count: 0,
        },
      ],
    },
    {
      id: "4",
      folder_name: "Hiking Trips",
      href: `/folder/4`,
      user_id: "",
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date(),
      notes: [
        {
          id: "1",
          title: "Trips I want to take in 2025",
          current_version: {
            id: "abcd",
            version_number: 7,
            is_published: true,
            published_at: new Date(),
          },
          is_pinned: false,
          is_deleted: false,
          created_at: new Date(),
          updated_at: new Date(),
          shared_with_count: 0,
        },
      ],
    },
  ];
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
              {/* <p className="text-sm font-semibold">{user?.fullName}</p> */}
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
        <SidebarGroup>
          <SidebarGroupLabel>Get Started</SidebarGroupLabel>
          <SidebarGroupContent>
            <FolderList
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
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Your Folders */}
        <SidebarGroup>
          <SidebarGroupLabel>Your Folders</SidebarGroupLabel>
          <SidebarGroupContent>
            <FolderList
              folders={userFolders}
              recentlyDeleted={recentlyDeleted}
              shared={shared}
            />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Your AI Conversations</SidebarGroupLabel>
          <SidebarGroupContent>
            {/* TO DO - create conversations list similar to folder list above
              probably need to make folderlist more generalized?
            */}
          </SidebarGroupContent>
        </SidebarGroup>
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

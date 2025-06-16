import { FilePlus2Icon, FolderPlusIcon } from "lucide-react";
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
import { currentUser } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import FolderList from "@/components/web/FolderList";
import ThemeSwitch from "@/components/ThemeSwitch";

const WebSidebar = async () => {
  const user = await currentUser();
  // TO DO - get the users folders from DB
  const userFolders = [
    {
      id: "1",
      folder_name: "All Notes",
      link: `/folder/1`,
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
      link: `/folder/2`,
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
      link: `/folder/3`,
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
      link: `/folder/4`,
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
    link: `/folder/111`,
    notes: [],
  };

  // TO DO - get the shared notes from db
  const shared = {
    id: "22",
    folder_name: "Shared With You",
    link: `/folder/222`,
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
              <p className="text-sm font-semibold">{user?.fullName}</p>
            </div>
          </SignedIn>
          {/* Additional Controls */}
          <div>
            {/* Collapse Sidebar */}
            <WebSidebarInternalTrigger />
          </div>
        </div>
        <TooltipProvider>
          <div className="flex items-center">
            {/* New Note */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={"ghost"}>
                  <FilePlus2Icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add a New Note</TooltipContent>
            </Tooltip>

            {/* New Folder */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={"ghost"}>
                  <FolderPlusIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add a New Folder</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
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
                  link: "/dashboard",
                  notes: [],
                },
              ]}
              showCount={false}
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
        <ThemeSwitch />
        <BrandingHeader />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default WebSidebar;

import {
  ChevronRightIcon,
  FilePlus2Icon,
  FolderIcon,
  FolderPlusIcon,
  Trash2Icon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import WebSidebarInternalTrigger from "./WebSidebarInternalTrigger";
import BrandingHeader from "@/components/BrandingHeader";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Folder } from "@/lib/types";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import FolderList from "@/components/web/FolderList";

const WebSidebar = async () => {
  const user = await currentUser();
  // TO DO - get the users folders from DB
  const folders = [
    {
      id: "1",
      folder_name: "All Notes",
      notes: [
        {
          title: "Trips I want to take in 2025",
          current_version: {
            version_number: 7,
            is_published: true,
            published_at: new Date(),
          },
          created_at: new Date(),
          updated_at: new Date(),
          shared_with_count: 0,
        },
        {
          title: "Beef Stew Recipe",
          current_version: {
            version_number: 2,
            is_published: true,
            published_at: new Date(),
          },
          created_at: new Date(),
          updated_at: new Date(),
          shared_with_count: 0,
        },
        {
          title: "Groceries",
          current_version: {
            version_number: 4,
            is_published: false,
            published_at: null,
          },
          created_at: new Date(),
          updated_at: new Date(),
          shared_with_count: 0,
        },
        {
          title: "2025 Summer Training Plans",
          current_version: {
            version_number: 14,
            is_published: true,
            published_at: new Date(),
          },
          created_at: new Date(),
          updated_at: new Date(),
          shared_with_count: 0,
        },
      ],
    },
    {
      id: "2",
      folder_name: "Cooking",
      notes: [
        {
          title: "Beef Stew Recipe",
          current_version: {
            version_number: 2,
            is_published: true,
            published_at: new Date(),
          },
          created_at: new Date(),
          updated_at: new Date(),
          shared_with_count: 0,
        },
        {
          title: "Groceries",
          current_version: {
            version_number: 4,
            is_published: false,
            published_at: null,
          },
          created_at: new Date(),
          updated_at: new Date(),
          shared_with_count: 0,
        },
      ],
    },
    {
      id: "3",
      folder_name: "Climbing",
      notes: [
        {
          title: "2025 Summer Training Plans",
          current_version: {
            version_number: 14,
            is_published: true,
            published_at: new Date(),
          },
          created_at: new Date(),
          updated_at: new Date(),
          shared_with_count: 0,
        },
      ],
    },
    {
      id: "4",
      folder_name: "Hiking Trips",
      notes: [
        {
          title: "Trips I want to take in 2025",
          current_version: {
            version_number: 7,
            is_published: true,
            published_at: new Date(),
          },
          created_at: new Date(),
          updated_at: new Date(),
          shared_with_count: 0,
        },
      ],
    },
  ];
  // TO DO - get the users recently deleted folders from DB
  const recentlyDeleted = {
    id: "111",
    folder_name: "Recently Deleted",
    notes: [],
  };

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
        {/* Your Folders */}
        <SidebarGroup>
          <SidebarGroupLabel>Your Folders</SidebarGroupLabel>
          <SidebarGroupContent>
            <FolderList folders={folders} recentlyDeleted={recentlyDeleted} />
          </SidebarGroupContent>
        </SidebarGroup>
        {/* shared folders */}
        <SidebarGroup>
          <SidebarGroupLabel>Shared Folders</SidebarGroupLabel>
          <SidebarGroupContent>Shared Folders go here</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <BrandingHeader />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default WebSidebar;

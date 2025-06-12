import { FilePlus2Icon, FolderIcon, FolderPlusIcon } from "lucide-react";

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
import BrandingHeader from "@/components/shared/BrandingHeader";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Folder } from "@/lib/types";

const WebSidebar = async () => {
  const user = await currentUser();
  // TO DO - get the users folders from DB
  const folders = [
    {
      id: "1",
      folder_name: "All Notes",
      count: 112,
    },
    {
      id: "2",
      folder_name: "Cooking",
      count: 23,
    },
    {
      id: "3",
      folder_name: "Climbing",
      count: 12,
    },
    {
      id: "4",
      folder_name: "Hiking Trips",
      count: 41,
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
            {/* New Note */}
            <Button variant={"ghost"}>
              <FilePlus2Icon className="h-4 w-4" />
            </Button>
            {/* Collapse Sidebar */}
            <WebSidebarInternalTrigger />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Your Folders</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* button to create a new folder */}
              <SidebarMenuItem key={"000"}>
                <SidebarMenuButton
                  variant={"outline"}
                  className="bg-transparent"
                >
                  <FolderPlusIcon className="h-4 w-4" />
                  New Folder
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* your folders */}
              {folders.map((folder: Folder) => (
                <SidebarMenuItem key={folder.id}>
                  <SidebarMenuButton asChild>
                    <a href={"#"}>
                      <FolderIcon className="h-4 w-4" />
                      <span>{folder.folder_name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
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

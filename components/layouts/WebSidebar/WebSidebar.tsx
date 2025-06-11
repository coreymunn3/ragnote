import {
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
import BrandingHeader from "@/components/shared/BrandingHeader";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";

// Menu items.
const items = [
  {
    title: "All Notes",
    url: "#",
    icon: FolderIcon,
  },
  {
    title: "Cooking",
    url: "#",
    icon: FolderIcon,
  },
  {
    title: "Climbing",
    url: "#",
    icon: FolderIcon,
  },
  {
    title: "Hiking Trips",
    url: "#",
    icon: FolderIcon,
  },
  {
    title: "Recently Deleted",
    url: "#",
    icon: Trash2Icon,
  },
];

const WebSidebar = async () => {
  const user = await currentUser();
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
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
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

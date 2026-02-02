"use client";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LucideIcon, MessageSquareIcon, Trash2Icon } from "lucide-react";
import WebSidebarLink from "./WebSidebarLink";

interface WebSidebarLinkGroupProps {
  links: {
    href: string;
    label: string;
    icon: LucideIcon;
  }[];
  groupName: string;
}

const WebSidebarLinkGroup = ({
  links,
  groupName,
}: WebSidebarLinkGroupProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{groupName}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {links.length > 0 &&
            links.map(({ href, icon, label }) => (
              <SidebarMenuItem key={label}>
                <WebSidebarLink href={href} icon={icon} label={label} />
              </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
export default WebSidebarLinkGroup;

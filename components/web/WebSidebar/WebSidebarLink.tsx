"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WebSidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

const WebSidebarLink = ({ href, icon: Icon, label }: WebSidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <div className="p-1 rounded-md hover:bg-primary/30 transition-colors duration-200">
      <Button
        className="p-2 hover:bg-transparent dark:hover:bg-transparent"
        variant={"ghost"}
        asChild
      >
        <Link href={href}>
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </Link>
      </Button>
    </div>
  );
};

export default WebSidebarLink;

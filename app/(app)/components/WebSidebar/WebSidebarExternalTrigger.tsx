"use client";
import { useSidebar } from "@/components/ui/sidebar";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const WebSidebarExternalTrigger = () => {
  const { toggleSidebar, open } = useSidebar();

  if (!open) {
    return (
      <Button variant="ghost" onClick={toggleSidebar}>
        <MenuIcon className="h-4 w-4" />{" "}
      </Button>
    );
  }
};

export default WebSidebarExternalTrigger;

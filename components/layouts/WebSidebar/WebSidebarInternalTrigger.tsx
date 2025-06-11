"use client";
import { useSidebar } from "@/components/ui/sidebar";
import { ChevronsLeftIcon } from "lucide-react";
import { Button } from "../../ui/button";

const WebSidebarInternalTrigger = () => {
  const { toggleSidebar, open } = useSidebar();

  if (open) {
    return (
      <Button variant="ghost" onClick={toggleSidebar}>
        <ChevronsLeftIcon className="h-4 w-4" />{" "}
      </Button>
    );
  }
};

export default WebSidebarInternalTrigger;

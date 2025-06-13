import { SidebarProvider } from "@/components/ui/sidebar";
import WebSidebar from "./WebSidebar";
import WebSidebarExternalTrigger from "./WebSidebarExternalTrigger";
import ThemeSwitch from "@/components/ThemeSwitch";
import { Button } from "@/components/ui/button";
import { EllipsisVerticalIcon } from "lucide-react";

export default function WebSidebarWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <WebSidebar />
      <main className="w-full p-1">
        <div className="flex items-center">
          {/* left side controls */}
          <div className="flex-1">
            <WebSidebarExternalTrigger />
          </div>
          {/* right side controls */}
          <div className="flex space-x-1">
            <ThemeSwitch />
            {/* a global options control */}
            <Button variant={"ghost"}>
              <EllipsisVerticalIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}

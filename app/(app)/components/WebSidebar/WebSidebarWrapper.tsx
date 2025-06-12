import { SidebarProvider } from "@/components/ui/sidebar";
import WebSidebar from "./WebSidebar";
import WebSidebarExternalTrigger from "./WebSidebarExternalTrigger";
import ThemeSwitch from "../layouts/ThemeSwitch";

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
          <div>
            <ThemeSwitch />
          </div>
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}

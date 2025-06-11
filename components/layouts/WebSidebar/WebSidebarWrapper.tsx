import { SidebarProvider } from "@/components/ui/sidebar";
import WebSidebar from "./WebSidebar";
import WebSidebarExternalTrigger from "./WebSidebarExternalTrigger";

export default function WebSidebarWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <WebSidebar />
      <main>
        <div className="flex items-center">
          <WebSidebarExternalTrigger />
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}

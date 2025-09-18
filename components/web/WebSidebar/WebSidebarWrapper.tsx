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
      <main className="w-full relative min-w-0 flex-1">
        <div className="absolute top-0 left-0 p-2">
          <WebSidebarExternalTrigger />
        </div>
        <div className="w-full min-w-0 overflow-hidden">{children}</div>
      </main>
    </SidebarProvider>
  );
}

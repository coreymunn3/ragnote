import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import WebSidebar from "./WebSidebar";

export default function WebSidebarWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <WebSidebar />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}

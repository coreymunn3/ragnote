import WebSidebarWrapper from "@/components/web/WebSidebar/WebSidebarWrapper";
import BackgroundPattern from "@/components/BackgroundPattern";
import PersistentOfflineIndicator from "@/components/web/PersistentOfflineIndicator";

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative">
      <BackgroundPattern />

      {/* Main content */}
      <div className="relative z-10">
        <WebSidebarWrapper>{children}</WebSidebarWrapper>
      </div>
      <PersistentOfflineIndicator />
    </div>
  );
}

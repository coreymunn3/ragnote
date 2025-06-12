import WebSidebarWrapper from "../components/WebSidebar/WebSidebarWrapper";

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <WebSidebarWrapper>{children}</WebSidebarWrapper>
    </div>
  );
}

import React from "react";

// Similar to ResponsiveView but specifically for layouts
interface ResponsiveLayoutProps {
  MobileLayout: React.ComponentType<{ children: React.ReactNode }>;
  WebLayout: React.ComponentType<{ children: React.ReactNode }>;
  children: React.ReactNode;
}

export default function ResponsiveLayout({
  MobileLayout,
  WebLayout,
  children,
}: ResponsiveLayoutProps) {
  return (
    <>
      {/* Mobile Layout: Visible only on small screens */}
      <div className="md:hidden">
        <MobileLayout>{children}</MobileLayout>
      </div>

      {/* Web Layout: Hidden on small screens, visible from md breakpoint and up */}
      <div className="hidden md:block">
        <WebLayout>{children}</WebLayout>
      </div>
    </>
  );
}

import React from "react";

// This is a server component (no "use client" directive)
// It accepts JSX elements directly rather than component functions
interface ResponsiveViewProps {
  mobileView: React.ReactNode;
  webView: React.ReactNode;
}

export default function ResponsiveView({
  mobileView,
  webView,
}: ResponsiveViewProps) {
  return (
    <>
      {/* Mobile Content: Visible only on small screens */}
      <div className="md:hidden">{mobileView}</div>

      {/* Web Content: Hidden on small screens, visible from md breakpoint and up */}
      <div className="hidden md:block">{webView}</div>
    </>
  );
}

import ResponsiveLayout from "@/components/ResponsiveLayout";
import React from "react";
import WebRecentlyDeletedPageLayout from "../components/layouts/web/recently-deleted/layout";
import MobileRecentlyDeletedPageLayout from "../components/layouts/mobile/recently-deleted/layout";

const RecentlyDeletedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ResponsiveLayout
      WebLayout={WebRecentlyDeletedPageLayout}
      MobileLayout={MobileRecentlyDeletedPageLayout}
    >
      {children}
    </ResponsiveLayout>
  );
};

export default RecentlyDeletedLayout;

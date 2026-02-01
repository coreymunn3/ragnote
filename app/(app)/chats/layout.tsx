import ResponsiveLayout from "@/components/ResponsiveLayout";
import React from "react";
import WebChatsPageLayout from "../components/layouts/web/chats/layout";
import MobileChatsPageLayout from "../components/layouts/mobile/chats/layout";

const ChatsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ResponsiveLayout
      WebLayout={WebChatsPageLayout}
      MobileLayout={MobileChatsPageLayout}
    >
      {children}
    </ResponsiveLayout>
  );
};

export default ChatsLayout;

"use client";

import React from "react";
import { SignedIn } from "@clerk/nextjs";
import BrandingHeader from "@/components/BrandingHeader";
import UserButtonCustom from "../UserButtonCustom";
import { useMobileHeader } from "@/contexts/MobileHeaderContext";

const MobileHeader = () => {
  const { headerConfig } = useMobileHeader();

  // Default content if none is set (Dashboard page behavior)
  const leftContent = headerConfig.leftContent || null;
  const centerContent = headerConfig.centerContent || null;
  const rightContent = headerConfig.rightContent || null;

  return (
    <header className="fixed top-0 right-0 h-12 w-full z-50 flex items-center justify-between px-4 py-2 bg-sidebar">
      {/* Left Section */}
      <div className="flex items-center space-x-2">{leftContent}</div>

      {/* Center Section */}
      {centerContent && (
        <div className="flex-1 flex justify-center">{centerContent}</div>
      )}

      {/* Right Section - custom content + always show User Button */}
      <div className="flex items-center space-x-2">
        {rightContent}
        <SignedIn>
          <UserButtonCustom />
        </SignedIn>
      </div>
    </header>
  );
};

export default MobileHeader;

import React from "react";
import { SignedIn } from "@clerk/nextjs";
import ThemeSwitch from "@/components/ThemeSwitch";
import BrandingHeader from "@/components/BrandingHeader";
import UserButtonCustom from "../UserButtonCustom";

const MobileHeader = () => {
  return (
    <header className="fixed top-0 right-0 w-full z-50 flex items-center justify-between px-4 py-2 bg-sidebar">
      {/* Brand/Logo Section */}
      <div>
        <BrandingHeader />{" "}
      </div>
      {/* Right-hand side actions (Theme Switch, User Button) */}
      <div className="flex items-center space-x-4">
        {/* Theme Switch */}
        <ThemeSwitch />

        {/* User Button (Clerk) */}
        <SignedIn>
          <UserButtonCustom />
        </SignedIn>
      </div>
    </header>
  );
};

export default MobileHeader;

import React from "react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import ThemeSwitch from "./ThemeSwitch";
import BrandingHeader from "@/components/BrandingHeader";

const MobileHeader = () => {
  return (
    <header className="flex items-center justify-between px-4 py-4">
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
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
};

export default MobileHeader;

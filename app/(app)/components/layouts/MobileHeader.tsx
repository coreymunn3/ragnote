import React from "react";
import { SignedIn } from "@clerk/nextjs";
import ThemeSwitch from "@/components/ThemeSwitch";
import BrandingHeader from "@/components/BrandingHeader";
import UserButtonClient from "../../../../components/UserButtonClient";

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
          <UserButtonClient />
        </SignedIn>
      </div>
    </header>
  );
};

export default MobileHeader;

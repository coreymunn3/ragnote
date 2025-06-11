import React from "react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { BrainIcon } from "lucide-react";
import ThemeSwitch from "./ThemeSwitch";

const MobileHeader = () => {
  return (
    <header className="flex items-center justify-between px-4 py-4">
      {/* Brand/Logo Section */}
      <div className="flex items-center">
        <BrainIcon className="h-6 w-6 text-primary" />{" "}
        {/* Assuming 'text-primary' is a Tailwind color */}
        <span className="ml-2 text-lg font-bold">RagNote AI</span>
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

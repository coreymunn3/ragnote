"use client";

import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import ThemeSwitch from "@/components/ThemeSwitch";
import { SignInButton } from "@clerk/nextjs";

export default function LandingNavbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Logo width={60} height={60} />
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <SignInButton mode="modal">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </SignInButton>
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </nav>
  );
}

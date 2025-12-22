"use client";

import { UserButton } from "@clerk/nextjs";
import {
  CrownIcon,
  CreditCardIcon,
  CheckIcon,
  MoonIcon,
  PaletteIcon,
  SunIcon,
  MonitorIcon,
} from "lucide-react";
import { TypographyLarge, TypographyP, TypographyMuted } from "./ui/typography";
import MembershipView from "./MembershipView";
import { Button } from "./ui/button";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const AppearancePage = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const themeOptions = [
    {
      value: "system",
      label: "System",
      description: "Follow device settings",
      icon: <MonitorIcon className="h-4 w-4" />,
    },
    {
      value: "light",
      label: "Light",
      description: "Light theme",
      icon: <SunIcon className="h-4 w-4" />,
    },
    {
      value: "dark",
      label: "Dark",
      description: "Dark theme",
      icon: <MoonIcon className="h-4 w-4" />,
    },
  ];

  return (
    <div className="flex flex-col space-y-6 p-4">
      {/* Header Section */}
      <div className="flex items-center space-x-3">
        <PaletteIcon className="h-8 w-8 text-primary" />
        <div>
          <TypographyLarge>Appearance</TypographyLarge>
          <TypographyMuted>Customize your theme preference</TypographyMuted>
        </div>
      </div>

      {/* Theme Selector Section */}
      <div className="space-y-4">
        <div>
          <TypographyP className="font-semibold mb-3">Theme</TypographyP>
          <div className="space-y-2">
            {themeOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  mounted && theme === option.value ? "default" : "outline"
                }
                className="w-full justify-between h-auto py-3"
                onClick={() => setTheme(option.value)}
              >
                <div className="flex items-center space-x-3">
                  {option.icon}
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{option.label}</span>
                    <span className="text-xs font-normal">
                      {option.description}
                    </span>
                  </div>
                </div>
                {mounted && theme === option.value && (
                  <CheckIcon className="h-4 w-4" />
                )}
              </Button>
            ))}
          </div>
        </div>

        <TypographyMuted className="text-sm">
          Choose how RagNote AI looks to you. Select a single theme, or sync
          with your system settings.
        </TypographyMuted>
      </div>
    </div>
  );
};

export default function UserButtonCustom() {
  return (
    <UserButton>
      {/* You can pass the content as a component */}
      <UserButton.UserProfilePage
        label="Membership"
        url="membership"
        labelIcon={<CrownIcon className="w-4 h-4" />}
      >
        <MembershipView />
      </UserButton.UserProfilePage>
      <UserButton.UserProfilePage label="account" />
      <UserButton.UserProfilePage label="security" />
      <UserButton.UserProfilePage
        label="Appearance"
        url="appearance"
        labelIcon={<PaletteIcon className="h-4 w-4" />}
      >
        <AppearancePage />
      </UserButton.UserProfilePage>
    </UserButton>
  );
}

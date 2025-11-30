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
import { useUserSubscription } from "@/hooks/user/useUserSubscription";
import { useCreateBillingPortalSession } from "@/hooks/user/useCreateBillingPortalSession";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  MEMBERSHIP_FEATURES,
  MEMBERSHIP_UPGRADE_FEATURES,
  UPGRADE_BUTTON_LABEL,
} from "@/CONSTANTS";
import { useCreateCheckoutSession } from "@/hooks/user/useCreateCheckoutSession";
import { getIconComponent } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const AppearancePage = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get current theme icon
  const getCurrentThemeIcon = () => {
    if (!mounted) return <MonitorIcon className="h-5 w-5" />;

    switch (theme) {
      case "light":
        return <SunIcon className="h-5 w-5" />;
      case "dark":
        return <MoonIcon className="h-5 w-5" />;
      default:
        return <MonitorIcon className="h-5 w-5" />;
    }
  };

  // Get theme display name
  const getThemeDisplayName = () => {
    if (!mounted) return "System";

    switch (theme) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      default:
        return "System";
    }
  };

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

const MembershipPage = () => {
  const { data: membership, isLoading, isError } = useUserSubscription();
  const billingPortalMutation = useCreateBillingPortalSession();
  const checkoutSessionMutation = useCreateCheckoutSession();

  // Handle billing portal or upgrade actions
  const handleManageBilling = () => {
    billingPortalMutation.mutate({
      return_url: window.location.href,
    });
  };

  // handle upgrade via checkout session
  const handleUpgradeClick = async () => {
    checkoutSessionMutation.mutate({
      return_url: window.location.href,
    });
  };

  if (isLoading) {
    return <Skeleton className="w-full h-32" />;
  }

  if (!membership) {
    return <div>Error loading membership</div>;
  }

  const membershipConfig = MEMBERSHIP_FEATURES[membership.tier];
  const TierIcon = getIconComponent(membershipConfig.icon);

  return (
    <div className="flex flex-col space-y-6 p-4">
      {/* Header Section */}
      <div className="flex items-center space-x-3">
        <TierIcon className={`h-8 w-8 ${membershipConfig.color}`} />
        <div>
          <TypographyLarge>{membershipConfig.name} Membership</TypographyLarge>
          {membership.tier === "PRO" && membership.end_date && (
            <TypographyMuted>
              Next billing: {new Date(membership.end_date).toLocaleDateString()}
            </TypographyMuted>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="space-y-4">
        <div>
          <TypographyP className="font-semibold mb-2">
            {membership.tier === "PRO" ? "Your Pro benefits:" : "What you get:"}
          </TypographyP>
          <div className="space-y-2">
            {membershipConfig.features.map((feature, index) => {
              const FeatureIcon = getIconComponent(feature.icon);
              return (
                <div key={index} className="flex items-center space-x-2">
                  <CheckIcon className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upgrade Teaser for Free Users */}
        {membership.tier === "FREE" && (
          <div className="pt-2 border-t">
            <TypographyP className="font-semibold mb-2">
              Want more? Upgrade for advanced features:
            </TypographyP>
            <TypographyMuted className="text-sm">
              {MEMBERSHIP_UPGRADE_FEATURES.join(" • ")}
            </TypographyMuted>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="pt-2">
        {membership.tier === "PRO" ? (
          <Button
            onClick={handleManageBilling}
            disabled={billingPortalMutation.isPending}
            className="w-full"
            variant="outline"
          >
            {billingPortalMutation.isPending ? (
              <>
                <CreditCardIcon className="h-4 w-4 mr-2 animate-pulse" />
                Opening...
              </>
            ) : (
              <>
                <CreditCardIcon className="h-4 w-4 mr-2" />
                Manage Billing
              </>
            )}
          </Button>
        ) : (
          <Button onClick={handleUpgradeClick} className="w-full">
            <CrownIcon className="h-4 w-4 mr-2" />
            {UPGRADE_BUTTON_LABEL}
          </Button>
        )}
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
        <MembershipPage />
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

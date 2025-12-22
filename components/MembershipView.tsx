"use client";

import { useUserSubscription } from "@/hooks/user/useUserSubscription";
import { useCreateBillingPortalSession } from "@/hooks/user/useCreateBillingPortalSession";
import { Skeleton } from "./ui/skeleton";
import {
  MEMBERSHIP_FEATURES,
  MEMBERSHIP_UPGRADE_FEATURES,
  UPGRADE_BUTTON_LABEL,
} from "@/CONSTANTS";
import { useCreateCheckoutSession } from "@/hooks/user/useCreateCheckoutSession";
import { getIconComponent } from "@/lib/utils";
import { TypographyLarge, TypographyMuted, TypographyP } from "./ui/typography";
import { CheckIcon, CreditCardIcon, CrownIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect } from "react";

interface MembershipViewProps {
  upgradeOnMount?: boolean;
}

const MembershipView = ({ upgradeOnMount = false }: MembershipViewProps) => {
  const {
    data: membership,
    isLoading: membershipLoading,
    isError: membershipError,
  } = useUserSubscription();
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

  /**
   * If we want to upgrade as soon as the page is visited, we run this useEffect
   * to create the checkout session
   */
  useEffect(() => {
    if (upgradeOnMount && membership) {
      checkoutSessionMutation.mutate({
        return_url: `${window.location.origin}/dashboard`,
      });
    }
  }, [upgradeOnMount, membership]);

  if (membershipLoading) {
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

export default MembershipView;

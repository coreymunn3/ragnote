"use client";

import { Loader2Icon, Crown } from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { cn, getIconComponent } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";
import { forwardRef, useState } from "react";
import { useUserSubscription } from "@/hooks/user/useUserSubscription";
import { MEMBERSHIP_FEATURES, UPGRADE_BUTTON_LABEL } from "@/CONSTANTS";
import { useCreateCheckoutSession } from "@/hooks/user/useCreateCheckoutSession";
import { Skeleton } from "./ui/skeleton";

interface ProButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  label?: string;
  icon?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  showIcon?: boolean;
}

/**
 * Extends all standard button props and supports all Button component variants
 */
const ProButton = forwardRef<HTMLButtonElement, ProButtonProps>(
  (
    {
      label,
      icon: IconComponent,
      className,
      variant = "default",
      size = "sm",
      isLoading = false,
      disabled,
      onClick: intendedOnClick,
      ...props
    },
    ref
  ) => {
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const checkoutSessionMutation = useCreateCheckoutSession();

    // get the user's current subscription
    const {
      isPro: userIsPro,
      data: userSubscription,
      isLoading: subscriptionLoading,
      isError: subscriptionError,
    } = useUserSubscription();

    // Handle upgrade to Pro via Stripe checkout
    const handleUpgrade = async () => {
      checkoutSessionMutation.mutate({
        return_url: window.location.href,
      });
    };

    // Determine click handler: Pro users get intended action, others get upgrade modal
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (userIsPro && !subscriptionError) {
        intendedOnClick?.(e);
      } else {
        setShowUpgradeModal(true);
      }
    };

    return (
      <>
        <Button
          ref={ref}
          variant={variant}
          size={size}
          className={cn("gap-2", className)}
          disabled={disabled || isLoading}
          onClick={handleClick}
          {...props}
        >
          {isLoading || subscriptionLoading ? (
            <Skeleton className="h-6 w-6"></Skeleton>
          ) : (
            <>
              {label}
              {IconComponent && IconComponent}
            </>
          )}
        </Button>

        {/* Upgrade modal for non-Pro users */}
        <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                Upgrade to Pro
              </DialogTitle>
              <DialogDescription>
                Unlock all features and supercharge your productivity!
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="space-y-3">
                {MEMBERSHIP_FEATURES.PRO.features.map((feature, index) => {
                  const FeatureIcon = getIconComponent(feature.icon);
                  const colors = [
                    "text-blue-600",
                    "text-green-600",
                    "text-purple-600",
                    "text-orange-600",
                    "text-yellow-600",
                  ];

                  return (
                    <div key={index} className="flex items-center gap-3">
                      <FeatureIcon
                        className={`h-4 w-4 ${colors[index % colors.length]}`}
                      />
                      <span className="text-sm">{feature.text}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {MEMBERSHIP_FEATURES.PRO.price}
                  </div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-col space-y-2">
              <Button
                onClick={handleUpgrade}
                disabled={checkoutSessionMutation.isPending}
                className="w-full"
              >
                {checkoutSessionMutation.isPending ? (
                  <>
                    <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                    Redirecting to checkout...
                  </>
                ) : (
                  <>{UPGRADE_BUTTON_LABEL}</>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowUpgradeModal(false)}
                className="w-full"
              >
                Maybe Later
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }
);

ProButton.displayName = "ProButton";

export default ProButton;

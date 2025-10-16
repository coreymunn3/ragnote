"use client";

import { Loader2Icon, Crown, Zap, MessageCircle } from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";
import { forwardRef, useState } from "react";
import { useUserSubscription } from "@/hooks/user/useUserSubscription";

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
      children,
      ...props
    },
    ref
  ) => {
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradingToStripe, setUpgradingToStripe] = useState(false);

    // get the user's current subscription
    const {
      isPro: userIsPro,
      data: userSubscription,
      isLoading: subscriptionLoading,
      isError: subscriptionError,
    } = useUserSubscription();

    // Handle upgrade to Pro via Stripe checkout
    const handleUpgrade = async () => {
      setUpgradingToStripe(true);
      try {
        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
        });
        const { url } = await response.json();
        if (url) {
          window.location.href = url;
        }
      } catch (error) {
        console.error("Failed to create checkout session:", error);
        setUpgradingToStripe(false);
      }
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
          {label}
          {children}
          {(isLoading || subscriptionLoading) && (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          )}
          {IconComponent && IconComponent}
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
                <div className="flex items-center gap-3">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">
                    Unlimited notes and publishing
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">
                    Unlimited AI chat conversations
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Crown className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">Priority support</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">$1.99</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-col space-y-2">
              <Button
                onClick={handleUpgrade}
                disabled={upgradingToStripe}
                className="w-full"
              >
                {upgradingToStripe ? (
                  <>
                    <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                    Redirecting to checkout...
                  </>
                ) : (
                  "Subscribe Now"
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

"use client";

import { Loader2Icon } from "lucide-react";
import { Button, buttonVariants } from "./ui/button";

import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";
import { forwardRef, useState } from "react";
import { useUserSubscription } from "@/hooks/user/useUserSubscription";

import { useCreateCheckoutSession } from "@/hooks/user/useCreateCheckoutSession";
import UpgradeDialog from "./dialogs/UpgradeDialog";

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
    ref,
  ) => {
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    // get the user's current subscription
    const {
      isPro: userIsPro,
      data: userSubscription,
      isLoading: subscriptionLoading,
      isError: subscriptionError,
    } = useUserSubscription();

    // Determine click handler: Pro users get intended action, others get upgrade modal
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Don't handle click if button is disabled
      if (disabled) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

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
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {label}
              {IconComponent && IconComponent}
            </>
          )}
        </Button>
        {/* Upgrade modal for non-Pro users */}
        <UpgradeDialog
          open={showUpgradeModal}
          onOpenChange={setShowUpgradeModal}
        />
      </>
    );
  },
);

ProButton.displayName = "ProButton";

export default ProButton;

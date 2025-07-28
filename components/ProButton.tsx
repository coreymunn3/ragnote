"use client";

import { Loader2Icon, LockIcon } from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { useUserSubscription } from "@/hooks/user/useUserSubscription";

interface ProButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  label?: string;
  icon?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  showIcon?: boolean;
  tooltipText?: string;
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
      tooltipText,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // get the user's current subscription
    const {
      data: userSubscription,
      isLoading: subscriptionLoading,
      isError: subscriptionError,
    } = useUserSubscription();

    const userIsPro =
      userSubscription?.tier === "PRO" && userSubscription?.status === "ACTIVE";

    const lockMessage = `Upgrade to pro to gain access to this feature!`;

    // First and foremost - if user is not pro or if we can't tell, we lock & disable this element
    if (!userIsPro || subscriptionError) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  ref={ref}
                  variant={variant}
                  size={size}
                  className={cn("gap-2", className)}
                  disabled
                  {...props}
                >
                  {label}
                  {children}
                  {subscriptionLoading ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <LockIcon className="h-4 w-4" />
                  )}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>{lockMessage}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    // If User Is Pro:
    // If tooltipText is provided, wrap the button in a tooltip
    if (tooltipText) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  ref={ref}
                  variant={variant}
                  size={size}
                  className={cn("gap-2", className)}
                  disabled={disabled || isLoading}
                  {...props}
                >
                  {label}
                  {children}
                  {isLoading && (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  )}
                  {IconComponent && IconComponent}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>{tooltipText}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // If no tooltipText, render just the button without tooltip
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn("gap-2", className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {label}
        {children}
        {isLoading && <Loader2Icon className="h-4 w-4 animate-spin" />}
        {IconComponent && IconComponent}
      </Button>
    );
  }
);

ProButton.displayName = "ProButton";

export default ProButton;

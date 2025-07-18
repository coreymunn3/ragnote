"use client";

import { Loader2Icon, SparkleIcon } from "lucide-react";
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

interface AiButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  label: string;
  isLoading?: boolean;
  showIcon?: boolean;
  tooltipText?: string;
}

/**
 * A reusable AI button component with a sparkles icon
 * Extends all standard button props and supports all Button component variants
 */
const AiButton = forwardRef<HTMLButtonElement, AiButtonProps>(
  (
    {
      label,
      className,
      variant = "default",
      size = "sm",
      isLoading = false,
      tooltipText,
      disabled,
      ...props
    },
    ref
  ) => {
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
                  {isLoading ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <SparkleIcon className="h-4 w-4" />
                  )}
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
        {isLoading ? (
          <Loader2Icon className="h-4 w-4 animate-spin" />
        ) : (
          <SparkleIcon className="h-4 w-4" />
        )}
      </Button>
    );
  }
);

AiButton.displayName = "AiButton";

export default AiButton;

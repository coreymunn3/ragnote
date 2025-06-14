"use client";
import * as React from "react";

import { cn } from "@/lib/utils";

// Create a context for card variants
const CardContext = React.createContext<{ variant: "default" | "dense" }>({
  variant: "default",
});

// Custom hook for consuming the card context
const useCardContext = () => React.useContext(CardContext);

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "dense" }
>(({ className, variant = "default", ...props }, ref) => (
  <CardContext.Provider value={{ variant }}>
    <div
      ref={ref}
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow",
        className
      )}
      {...props}
    />
  </CardContext.Provider>
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { variant } = useCardContext();
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5",
        variant === "dense" ? "p-4" : "p-6",
        className
      )}
      {...props}
    />
  );
});
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { variant } = useCardContext();
  return (
    <div
      ref={ref}
      className={cn(variant === "dense" ? "p-4 pt-0" : "p-6 pt-0", className)}
      {...props}
    />
  );
});
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { variant } = useCardContext();
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center",
        variant === "dense" ? "p-4 pt-0" : "p-6 pt-0",
        className
      )}
      {...props}
    />
  );
});
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignUpButton } from "@clerk/nextjs";
import { getIconComponent } from "@/lib/utils";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Feature {
  readonly icon: string;
  readonly text: string;
}

interface PricingCardProps {
  name: string;
  icon: string;
  iconColor: string;
  price?: string;
  priceLabel: string;
  description: string;
  features: readonly Feature[];
  buttonText: string;
  buttonVariant?: "default" | "outline";
  emphasized?: boolean;
  badge?: string;
  showEverythingInFree?: boolean;
}

export default function PricingCard({
  name,
  icon,
  iconColor,
  price,
  priceLabel,
  description,
  features,
  buttonText,
  buttonVariant = "default",
  emphasized = false,
  badge,
  showEverythingInFree = false,
}: PricingCardProps) {
  const Icon = getIconComponent(icon);

  return (
    <Card
      className={cn(
        "relative",
        emphasized
          ? "border-primary shadow-lg shadow-primary/20 md:scale-105"
          : "border-border/50",
        emphasized && "bg-gradient-to-b from-primary/40 to-secondary/40"
      )}
    >
      {/* Optional Badge */}
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-4 py-1">
            {badge}
          </Badge>
        </div>
      )}

      <CardHeader
        className={cn("text-center pb-8", emphasized ? "pt-12" : "pt-8")}
      >
        <div
          className={cn(
            "inline-flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4",
            emphasized ? "bg-primary/10" : "bg-muted"
          )}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        {price ? (
          <div className="flex items-end justify-center gap-1">
            <span className="text-4xl font-bold">{price}</span>
            <span className=" mb-1">/month</span>
          </div>
        ) : (
          <div className="text-4xl font-bold mb-2">$0</div>
        )}
        <p className="text-muted-foreground text-sm">{priceLabel}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Optional "Everything in Free" text */}
        {showEverythingInFree && (
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Everything in Free, plus:
          </div>
        )}

        <ul className="space-y-3">
          {features.map((feature, index) => {
            const FeatureIcon = getIconComponent(feature.icon);
            return (
              <li key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className={cn("text-sm", emphasized && "font-medium")}>
                  {feature.text}
                </span>
              </li>
            );
          })}
        </ul>

        <SignUpButton mode="modal">
          <Button variant={buttonVariant} className="w-full mt-6">
            {buttonText}
          </Button>
        </SignUpButton>
      </CardContent>
    </Card>
  );
}

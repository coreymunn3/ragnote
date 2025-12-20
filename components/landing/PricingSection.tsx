"use client";

import { MEMBERSHIP_FEATURES } from "@/CONSTANTS";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignUpButton } from "@clerk/nextjs";
import { getIconComponent } from "@/lib/utils";
import { Check, Crown } from "lucide-react";

export default function PricingSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Choose Your Plan
          </h2>
          <p className="text-lg text-muted-foreground">
            Start free and upgrade when you're ready to unlock the full power of
            AI.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {/* FREE Tier */}
          <Card className="border-border/50">
            <CardHeader className="text-center pb-8 pt-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mx-auto mb-4">
                {(() => {
                  const Icon = getIconComponent(MEMBERSHIP_FEATURES.FREE.icon);
                  return (
                    <Icon
                      className={`w-6 h-6 ${MEMBERSHIP_FEATURES.FREE.color}`}
                    />
                  );
                })()}
              </div>
              <h3 className="text-2xl font-bold mb-2">
                {MEMBERSHIP_FEATURES.FREE.name}
              </h3>
              <div className="text-4xl font-bold mb-2">$0</div>
              <p className="text-muted-foreground text-sm">Forever free</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {MEMBERSHIP_FEATURES.FREE.features.map((feature, index) => {
                  const Icon = getIconComponent(feature.icon);
                  return (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature.text}</span>
                    </li>
                  );
                })}
              </ul>
              <SignUpButton mode="modal">
                <Button variant="outline" className="w-full mt-6">
                  Get Started Free
                </Button>
              </SignUpButton>
            </CardContent>
          </Card>

          {/* PRO Tier - Emphasized */}
          <Card className="border-primary/50 shadow-lg shadow-primary/10 relative md:scale-105">
            {/* Recommended Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-1">
                Recommended
              </Badge>
            </div>

            <CardHeader className="text-center pb-8 pt-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-4">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">
                {MEMBERSHIP_FEATURES.PRO.name}
              </h3>
              <div className="flex items-end justify-center gap-1">
                <span className="text-4xl font-bold">
                  {MEMBERSHIP_FEATURES.PRO.price}
                </span>
                <span className="text-muted-foreground mb-1">/month</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Unlock all AI features
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Include all FREE features */}
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Everything in Free, plus:
              </div>
              <ul className="space-y-3">
                {MEMBERSHIP_FEATURES.PRO.features.map((feature, index) => {
                  const Icon = getIconComponent(feature.icon);
                  return (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">
                        {feature.text}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <SignUpButton mode="modal">
                <Button className="w-full mt-6">Upgrade to Pro</Button>
              </SignUpButton>
            </CardContent>
          </Card>
        </div>

        {/* Additional info */}
        <p className="text-center text-sm text-muted-foreground mt-12">
          All plans include secure cloud storage and cross-device sync.
          <br />
          Cancel anytime, no questions asked.
        </p>
      </div>
    </section>
  );
}

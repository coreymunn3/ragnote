"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, SparklesIcon } from "lucide-react";
import { MEMBERSHIP_FEATURES } from "@/CONSTANTS";
import { getIconComponent } from "@/lib/utils";

interface WelcomeToProDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WelcomeToProDialog = ({
  open,
  onOpenChange,
}: WelcomeToProDialogProps) => {
  const handleStartExploring = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-xl">
            <Crown className="h-6 w-6 text-yellow-600" />
            Welcome to Pro!
            <span className="text-2xl">🎉</span>
          </DialogTitle>
          <DialogDescription className="text-center">
            Congratulations on upgrading! You now have access to all Pro
            features.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="text-center">
              <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                🚀 You're now a Pro member!
              </div>
              <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Here's what you can do now:
              </div>
            </div>
          </div>

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
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="p-1 rounded-full bg-muted">
                    <FeatureIcon
                      className={`h-4 w-4 ${colors[index % colors.length]}`}
                    />
                  </div>
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleStartExploring}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            Start Exploring
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeToProDialog;

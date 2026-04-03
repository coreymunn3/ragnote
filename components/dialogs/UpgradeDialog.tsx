"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { getIconComponent } from "@/lib/utils";
import { Crown, Loader2Icon } from "lucide-react";
import { MEMBERSHIP_FEATURES, UPGRADE_BUTTON_LABEL } from "@/CONSTANTS";
import { useCreateCheckoutSession } from "@/hooks/user/useCreateCheckoutSession";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => void;
}

const UpgradeDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: UpgradeDialogProps) => {
  const checkoutSessionMutation = useCreateCheckoutSession();

  // Handle upgrade to Pro via Stripe checkout
  const handleUpgrade = async () => {
    checkoutSessionMutation.mutate({
      return_url: window.location.href,
    });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
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
            onClick={() => {
              onOpenChange(false);
              onConfirm?.();
            }}
            className="w-full"
          >
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default UpgradeDialog;

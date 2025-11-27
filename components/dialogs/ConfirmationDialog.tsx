"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmText: string;
  confirmLoadingText?: string;
  confirmVariant?: "default" | "destructive";
  onConfirm: () => void;
  isLoading?: boolean;
}

const ConfirmationDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  confirmLoadingText,
  confirmVariant = "default",
  onConfirm,
  isLoading = false,
}: ConfirmationDialogProps) => {
  const isMobile = useIsMobile();

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  // Mobile: Render as bottom sheet
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
          <SheetFooter className="flex flex-row gap-2 pt-4">
            <SheetClose asChild>
              <Button variant="ghost" className="flex-1">
                Cancel
              </Button>
            </SheetClose>
            <Button
              onClick={handleConfirm}
              variant={confirmVariant}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? confirmLoadingText || "Loading..." : confirmText}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Render as centered dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleConfirm}
            variant={confirmVariant}
            disabled={isLoading}
          >
            {isLoading ? confirmLoadingText || "Loading..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;

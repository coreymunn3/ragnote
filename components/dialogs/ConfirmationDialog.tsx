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
import { Button } from "@/components/ui/button";

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
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

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

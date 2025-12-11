"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface InputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  placeholder: string;
  confirmText: string;
  confirmLoadingText?: string;
  onConfirm: (inputValue: string) => void;
  isLoading?: boolean;
  validate?: (value: string) => boolean;
  value?: string;
  onValueChange?: (value: string) => void;
}

const InputDialog = ({
  open,
  onOpenChange,
  title,
  placeholder,
  confirmText,
  confirmLoadingText,
  onConfirm,
  isLoading = false,
  validate,
  value,
  onValueChange,
}: InputDialogProps) => {
  const [internalValue, setInternalValue] = useState("");
  const isMobile = useIsMobile();

  // Use parent-controlled value if provided, otherwise use internal state
  const inputValue = value !== undefined ? value : internalValue;
  const setInputValue = onValueChange || setInternalValue;

  // Initialize internal value when dialog opens (only for non-parent-controlled state)
  useEffect(() => {
    if (open && value === undefined) {
      setInternalValue("");
    }
  }, [open, value]);

  const handleConfirm = () => {
    onConfirm(inputValue);
    onOpenChange(false);
  };

  const isValid = validate
    ? validate(inputValue)
    : inputValue.trim().length > 0;

  // Shared content for both Dialog and Sheet
  const content = (
    <>
      <Input
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && isValid && !isLoading) {
            handleConfirm();
          }
        }}
      />
    </>
  );

  // Mobile: Render as bottom sheet
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            {content}
          </SheetHeader>
          <SheetFooter className="flex flex-row gap-2 pt-4">
            <SheetClose asChild>
              <Button variant="ghost" className="flex-1">
                Cancel
              </Button>
            </SheetClose>
            <Button
              onClick={handleConfirm}
              disabled={!isValid || isLoading}
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
          {content}
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={handleConfirm} disabled={!isValid || isLoading}>
            {isLoading ? confirmLoadingText || "Loading..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InputDialog;

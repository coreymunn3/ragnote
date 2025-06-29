"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
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

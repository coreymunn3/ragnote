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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface SelectDialogProps<T = string> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  placeholder: string;
  confirmText: string;
  confirmLoadingText?: string;
  options: SelectOption<T>[];
  selectedValue?: T;
  onConfirm: (selectedValue: T) => void;
  isLoading?: boolean;
  disabled?: (option: SelectOption<T>) => boolean;
}

const SelectDialog = <T extends string | number>({
  open,
  onOpenChange,
  title,
  placeholder,
  confirmText,
  confirmLoadingText,
  options,
  selectedValue,
  onConfirm,
  isLoading = false,
  disabled,
}: SelectDialogProps<T>) => {
  const [internalSelectedValue, setInternalSelectedValue] = useState<
    T | undefined
  >(selectedValue);
  const isMobile = useIsMobile();

  const currentValue =
    selectedValue !== undefined ? selectedValue : internalSelectedValue;
  const selectedOption = options.find(
    (option) => option.value === currentValue
  );

  const handleConfirm = () => {
    if (currentValue !== undefined) {
      onConfirm(currentValue);
      onOpenChange(false);
    }
  };

  const handleSelect = (value: T) => {
    if (selectedValue === undefined) {
      setInternalSelectedValue(value);
    }
  };

  const isValid = currentValue !== undefined;
  const isOptionDisabled = (option: SelectOption<T>) => {
    return option.disabled || (disabled ? disabled(option) : false);
  };

  // Shared dropdown content
  const dropdownContent = (
    <div className="mt-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            disabled={isLoading}
          >
            {selectedOption ? selectedOption.label : placeholder}
            <ChevronDownIcon className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[var(--radix-dropdown-menu-trigger-width)]">
          {options.map((option) => (
            <DropdownMenuItem
              key={String(option.value)}
              onClick={() =>
                !isOptionDisabled(option) && handleSelect(option.value)
              }
              disabled={isOptionDisabled(option)}
              className={currentValue === option.value ? "bg-accent" : ""}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  // Mobile: Render as bottom sheet
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            {dropdownContent}
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
          {dropdownContent}
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

export default SelectDialog;

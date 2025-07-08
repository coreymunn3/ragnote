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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
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

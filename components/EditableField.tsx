"use client";
import { useState, useRef, useEffect, RefObject } from "react";
import {
  TypographyP,
  TypographyLarge,
  TypographySmall,
  TypographyMuted,
} from "./ui/typography";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

type TypographyVariant = "default" | "bold" | "small" | "large" | "muted";

interface EditableFieldProps {
  value: string;
  onSave: (newValue: string) => void;
  variant?: TypographyVariant;
  className?: string;
  placeholder?: string;
}

const EditableField = ({
  value,
  onSave,
  variant = "default",
  className = "",
  placeholder = "Enter text...",
}: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fieldValue, setFieldValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const typographyRef = useRef<HTMLElement>(null);
  const [elementWidth, setElementWidth] = useState<number | undefined>(
    undefined
  );

  // Update local value when prop value changes
  useEffect(() => {
    setFieldValue(value);
  }, [value]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text for easy replacement
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handle save function
  const handleSave = () => {
    const trimmedValue = fieldValue.trim();
    if (trimmedValue !== value && trimmedValue !== "") {
      onSave(trimmedValue);
    } else if (trimmedValue === "") {
      // Revert to original value if empty
      setFieldValue(value);
    }
    setIsEditing(false);
  };

  // Handle key press events (Enter to save, Escape to cancel)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setFieldValue(value);
      setIsEditing(false);
    }
  };

  // Determine styling classes based on variant
  const getInputClassName = () => {
    // Base styling without font size (will be added per variant)
    const baseClasses = "p-1 transition-all max-w-[200px]";

    switch (variant) {
      case "bold":
        // Match TypographyP with bold
        return cn(baseClasses, "text-base font-bold", className);
      case "small":
        // Match TypographySmall
        return cn(baseClasses, "text-sm font-medium", className);
      case "large":
        // Match TypographyLarge
        return cn(baseClasses, "text-lg font-semibold", className);
      case "muted":
        // Match TypographyMuted
        return cn(baseClasses, "text-sm text-muted-foreground", className);
      default:
        // Match TypographyP
        return cn(baseClasses, "text-base", className);
    }
  };

  // Handle entering edit mode
  const handleStartEditing = () => {
    // Measure the typography element width when entering edit mode
    if (typographyRef.current) {
      setElementWidth(typographyRef.current.offsetWidth);
    }
    setIsEditing(true);
  };

  // Render the appropriate typography component based on variant
  const renderTypography = () => {
    const commonProps = {
      className: cn(
        "px-2 py-1 cursor-text hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all max-w-[200px] truncate",
        className
      ),
      onClick: handleStartEditing,
      ref: typographyRef as RefObject<any>,
      style: { cursor: "text" },
    };

    const typographyElement = (() => {
      switch (variant) {
        case "bold":
          return (
            <TypographyP
              {...commonProps}
              className={cn(commonProps.className, "font-bold")}
            >
              {value}
            </TypographyP>
          );
        case "small":
          return <TypographySmall {...commonProps}>{value}</TypographySmall>;
        case "large":
          return <TypographyLarge {...commonProps}>{value}</TypographyLarge>;
        case "muted":
          return <TypographyMuted {...commonProps}>{value}</TypographyMuted>;
        default:
          return <TypographyP {...commonProps}>{value}</TypographyP>;
      }
    })();

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{typographyElement}</TooltipTrigger>
          <TooltipContent>{value}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return isEditing ? (
    <Input
      ref={inputRef}
      value={fieldValue}
      onChange={(e) => setFieldValue(e.target.value)}
      onBlur={handleSave}
      onKeyDown={handleKeyDown}
      className={getInputClassName()}
      placeholder={placeholder}
      style={elementWidth ? { width: `${elementWidth}px` } : {}}
    />
  ) : (
    renderTypography()
  );
};

export default EditableField;

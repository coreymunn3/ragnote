import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AnimatedListItem, AnimatedTypography } from "../animations";
import { STAGGER_DELAY } from "@/lib/animations";
import { TypographyMuted } from "../ui/typography";

interface WidgetGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  title?: string;
  icon?: ReactNode;
  className?: string;
  delay?: number; // Optional delay for child animations
  emptyContentMessage?: string; // Message to display when there are no items
}

const WidgetGrid = <T extends { id: string }>({
  items,
  renderItem,
  title,
  icon,
  className,
  delay = 0, // Default to no delay
  emptyContentMessage = "Nothing yet",
}: WidgetGridProps<T>) => {
  return (
    <div
      className={cn(
        className,
        "w-full p-4 rounded-md bg-gradient-to-br from-muted/70 via-background to-muted/40",
      )}
    >
      {/* Title area */}
      <div className="flex items-center pb-3 space-x-2">
        {icon}
        {title && (
          <AnimatedTypography
            variant="h3"
            className="pb-0"
            delay={delay * STAGGER_DELAY}
          >
            {title}
          </AnimatedTypography>
        )}
      </div>

      {/* Grid content */}
      <div className="pb-4">
        <div
          className={`grid ${!items.length || items.length === 1 ? "grid-cols-1" : "md:grid-cols-2 gap-4"}`}
        >
          {!items.length && emptyContentMessage && (
            <TypographyMuted className="py-4 text-center">
              {emptyContentMessage}
            </TypographyMuted>
          )}
          {items.map((item, index) => (
            <AnimatedListItem
              key={item.id}
              index={index}
              animation="fadeIn"
              delay={delay * STAGGER_DELAY}
            >
              {renderItem(item, index)}
            </AnimatedListItem>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WidgetGrid;

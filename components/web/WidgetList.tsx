import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ScrollableContainer } from "@/components/ui/scrollable-container";
import { AnimatedListItem, AnimatedTypography } from "../animations";
import { STAGGER_DELAY } from "@/lib/animations";

interface WidgetListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  title?: string;
  icon?: ReactNode;
  className?: string;
  emptyMessage?: string;
  delay?: number; // Optional delay for child animations
  displayMode?: "horizontal" | "grid" | "vertical"; // Control display as horizontal scroll or responsive grid
}

const WidgetList = <T extends { id: string }>({
  items,
  renderItem,
  title,
  icon,
  className,
  emptyMessage = "No items available",
  delay = 0, // Default to no delay
  displayMode = "horizontal", // Default to horizontal for backward compatibility
}: WidgetListProps<T>) => {
  if (!items || items.length === 0) {
    return <div className="text-muted-foreground py-4">{emptyMessage}</div>;
  }

  // Render content based on display mode
  const renderContent = () => {
    switch (displayMode) {
      case "grid":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, index) => (
              <AnimatedListItem
                key={item.id}
                index={index}
                animation="fadeInUp"
                delay={delay * STAGGER_DELAY}
              >
                {renderItem(item, index)}
              </AnimatedListItem>
            ))}
          </div>
        );
      case "vertical":
        return (
          <div className="flex flex-col space-y-2">
            {items.map((item, index) => (
              <AnimatedListItem
                key={item.id}
                index={index}
                animation="fadeIn"
                delay={delay * STAGGER_DELAY}
              >
                <div className="flex-shrink-0">{renderItem(item, index)}</div>
              </AnimatedListItem>
            ))}
          </div>
        );
      case "horizontal":
      default:
        return (
          <ScrollableContainer containerClassName="space-x-5 scrollbar-hide">
            {items.map((item, index) => (
              <AnimatedListItem
                key={item.id}
                index={index}
                animation="fadeInUp"
                delay={delay * STAGGER_DELAY}
              >
                <div className="flex-shrink-0">{renderItem(item, index)}</div>
              </AnimatedListItem>
            ))}
          </ScrollableContainer>
        );
    }
  };

  return (
    <div className={cn("w-full", className)}>
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

      {/* Content rendered based on display mode */}
      <div className="pb-4">{renderContent()}</div>
    </div>
  );
};

export default WidgetList;

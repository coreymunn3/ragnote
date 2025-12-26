import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollableContainer } from "@/components/ui/scrollable-container";
import { AnimatedListItem, AnimatedTypography } from "../animations";
import { STAGGER_DELAY } from "@/lib/animations";
import { Button } from "@/components/ui/button";

interface WidgetListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  title?: string;
  icon?: ReactNode;
  className?: string;
  emptyMessage?: string;
  delay?: number; // Optional delay for child animations
  displayMode?: "horizontal" | "grid" | "vertical"; // Control display as horizontal scroll or responsive grid
  initialItemLimit?: number; // Number of items to show initially
  showMoreIncrement?: number; // Number of items to add when "Show More" is clicked
  showMoreButton?: boolean; // Whether to show the "Show More" button
}

const WidgetList = <T extends { id: string }>({
  items,
  renderItem,
  title,
  icon,
  className,
  emptyMessage = "",
  delay = 0, // Default to no delay
  displayMode = "horizontal", // Default to horizontal for backward compatibility
  initialItemLimit,
  showMoreIncrement,
  showMoreButton = false,
}: WidgetListProps<T>) => {
  // State for pagination - simple and straightforward
  const [displayCount, setDisplayCount] = useState(
    initialItemLimit && initialItemLimit < items.length
      ? initialItemLimit
      : items.length
  );

  if (!items || items.length === 0) {
    return (
      <div className="text-muted-foreground text-sm py-0 text-center">
        {emptyMessage}
      </div>
    );
  }

  // Slice items based on current display count
  const visibleItems = showMoreButton ? items.slice(0, displayCount) : items;

  // Handlers for show more/less
  const handleShowMore = () => {
    const increment = showMoreIncrement || initialItemLimit || 6;
    setDisplayCount((prev) => Math.min(prev + increment, items.length));
  };

  const handleShowLess = () => {
    setDisplayCount(initialItemLimit || 6);
  };

  // Button visibility logic
  const canShowMore = displayCount < items.length;
  const canShowLess = initialItemLimit && displayCount > initialItemLimit;

  // Render content based on display mode
  const renderContent = () => {
    switch (displayMode) {
      case "grid":
        return (
          <div
            className={`grid ${visibleItems.length === 1 ? "grid-cols-1" : "md:grid-cols-2 gap-4"}`}
          >
            {visibleItems.map((item, index) => (
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
          <div className="flex flex-col space-y-4">
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
          <ScrollableContainer containerClassName="space-x-4 scrollbar-hide">
            {items.map((item, index) => (
              <AnimatedListItem
                key={item.id}
                index={index}
                animation="fadeInUp"
                delay={delay * STAGGER_DELAY}
              >
                <div className="flex-shrink-0 w-[300px]">
                  {renderItem(item, index)}
                </div>
              </AnimatedListItem>
            ))}
          </ScrollableContainer>
        );
    }
  };

  return (
    <div
      className={cn(
        className,
        "w-full p-4 rounded-md bg-gradient-to-br from-muted/70 via-background to-muted/40"
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

      {/* Content rendered based on display mode */}
      <div className="pb-4">{renderContent()}</div>

      {/* Show More / Show Less buttons */}
      {showMoreButton && (canShowMore || canShowLess) && (
        <div className="flex justify-center gap-2 mt-4">
          {canShowMore && (
            <Button variant="outline" onClick={handleShowMore}>
              Show More ({items.length - displayCount} more)
            </Button>
          )}
          {canShowLess && (
            <Button variant="ghost" onClick={handleShowLess}>
              Show Less
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default WidgetList;

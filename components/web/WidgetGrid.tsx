import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatedListItem, AnimatedTypography } from "../animations";
import { STAGGER_DELAY } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { TypographyMuted } from "../ui/typography";

interface WidgetGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  title?: string;
  icon?: ReactNode;
  className?: string;
  delay?: number; // Optional delay for child animations
  emptyContentMessage?: string; // Message to display when there are no items
  initialItemLimit?: number; // Number of items to show initially
  showMoreIncrement?: number; // Number of items to add when "Show More" is clicked
  showMoreButton?: boolean; // Whether to show the "Show More" button
}

const WidgetGrid = <T extends { id: string }>({
  items,
  renderItem,
  title,
  icon,
  className,
  delay = 0, // Default to no delay
  emptyContentMessage = "Nothing yet",
  initialItemLimit,
  showMoreIncrement,
  showMoreButton = false,
}: WidgetGridProps<T>) => {
  // State for pagination - simple and straightforward
  const [displayCount, setDisplayCount] = useState(
    initialItemLimit && initialItemLimit < items.length
      ? initialItemLimit
      : items.length
  );

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

      {/* Grid content */}
      <div className="pb-4">
        <div
          className={`grid ${!visibleItems.length || visibleItems.length === 1 ? "grid-cols-1" : "md:grid-cols-2 gap-4"}`}
        >
          {!visibleItems.length && emptyContentMessage && (
            <TypographyMuted className="py-4 text-center">
              {emptyContentMessage}
            </TypographyMuted>
          )}
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
      </div>

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

export default WidgetGrid;

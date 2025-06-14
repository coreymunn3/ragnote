import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ScrollableContainer } from "@/components/ui/scrollable-container";
import { AnimatedListItem } from "../animations";
import { TypographyH3 } from "../ui/typgrophy";

interface WidgetListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  title?: string;
  icon?: ReactNode;
  className?: string;
  emptyMessage?: string;
}

const WidgetList = <T extends { id: string }>({
  items,
  renderItem,
  title,
  icon,
  className,
  emptyMessage = "No items available",
}: WidgetListProps<T>) => {
  if (!items || items.length === 0) {
    return <div className="text-muted-foreground py-4">{emptyMessage}</div>;
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Title area */}
      <div className="flex items-center pb-3 space-x-2">
        {icon}
        {title && <TypographyH3 className="pb-0">{title}</TypographyH3>}
      </div>

      {/* Scrollable Container for the items */}
      <ScrollableContainer containerClassName="pb-2 space-x-5 scrollbar-hide">
        {items.map((item, index) => (
          <AnimatedListItem key={item.id} index={index} animation="fadeInUp">
            <div className="flex-shrink-0">{renderItem(item, index)}</div>
          </AnimatedListItem>
        ))}
      </ScrollableContainer>
    </div>
  );
};

export default WidgetList;

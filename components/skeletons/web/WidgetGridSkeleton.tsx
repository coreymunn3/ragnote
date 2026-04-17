import { Skeleton } from "@/components/ui/skeleton";
import { TypographyH3 } from "@/components/ui/typography";

interface WidgetGridSkeletonProps {
  title?: string;
  count?: number;
}

const WidgetGridSkeleton = ({ title, count = 4 }: WidgetGridSkeletonProps) => (
  <div className="w-full p-4 rounded-md bg-gradient-to-br from-muted/70 via-background to-muted/40">
    <div className="flex items-center pb-3 space-x-2">
      {title && <TypographyH3 className="pb-0">{title}</TypographyH3>}
    </div>
    <div className="pb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

export default WidgetGridSkeleton;

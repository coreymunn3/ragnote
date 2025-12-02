import { Skeleton } from "../ui/skeleton";

interface SearchResultsSkeletonProps {
  count?: number;
}

const SearchResultsSkeleton = ({ count = 3 }: SearchResultsSkeletonProps) => {
  return (
    <div className="p-2 flex space-x-2">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={`search-skeleton-${index}`} className="w-[250px] h-20" />
      ))}
    </div>
  );
};

export default SearchResultsSkeleton;

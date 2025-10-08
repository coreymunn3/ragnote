"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { CornerDownLeft, FileIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useSearch } from "@/hooks/search/useSearch";
import { AnimatedExpandable } from "../animations";
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";
import { SearchResultNote } from "@/lib/types/aiTypes";
import SearchResultItem from "./SearchResultItem";

interface IntegratedSearchProps {
  onSearch?: (query: string) => void;
}

const IntegratedSearch = (props: IntegratedSearchProps) => {
  const { onSearch } = props;
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultNote[]>([]);

  console.log(searchResults);

  /**
   * Mutation to execute the search
   * when it completes, we save the results in local state
   */
  const searchMutation = useSearch({
    onSuccess: (data) => setSearchResults(data),
  });

  /**
   * Run when the search is submitted
   */
  const handleSearch = () => {
    // ensure there is text in the input
    if (!(query.trim().length > 0)) {
      toast.info("Please enter a search query");
      return;
    }
    // execute the search
    searchMutation.mutate(query);
    // add any additional effects passed in from the parent
    if (onSearch) {
      onSearch(query);
    }
    // remove the query
    setQuery("");
  };

  return (
    <div className="flex flex-col p-1 border border-input dark:border-white w-full rounded-md focus-visible:ring-1 focus-visible:ring-ring shadow-sm">
      <div className="flex">
        {/* the input */}
        <Input
          placeholder="Search Your Notes"
          className="flex-1 border-none resize-none focus:border-none shadow-none focus-visible:ring-0"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              // initiate the search
              handleSearch();
            }
          }}
        />
        {/* the search button */}
        <div className="flex justify-end ">
          <Button
            variant={"ghost"}
            className="text-primary  hover:text-primary dark:text-white dark:hover:text-white"
            onClick={handleSearch}
          >
            {`Search`}
            <CornerDownLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* the search results */}
      <AnimatedExpandable
        isOpen={
          searchMutation.isPending ||
          (searchMutation.isSuccess && searchResults.length > 0)
        }
      >
        {/* show loading if mutation pending */}
        {searchMutation.isPending && (
          <div className="p-2 flex space-x-2">
            <Skeleton className="w-[250px] h-20" />
            <Skeleton className="w-[250px] h-20" />
            <Skeleton className="w-[250px] h-20" />
          </div>
        )}
        {/* show the items if search results exist */}
        {searchMutation.isSuccess && searchResults.length > 0 && (
          <div className="p-2 flex space-x-2">
            {searchResults.map((searchResult) => (
              <SearchResultItem
                key={searchResult.note.id}
                searchResult={searchResult}
              />
            ))}
          </div>
        )}
      </AnimatedExpandable>
    </div>
  );
};
export default IntegratedSearch;

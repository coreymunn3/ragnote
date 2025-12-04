"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  CircleAlertIcon,
  CornerDownLeft,
  BrainIcon,
  XIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { useSearch } from "@/hooks/search/useSearch";
import { AnimatedExpandable, AnimatedListItem } from "../animations";
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";
import {
  SearchMode,
  SearchResult,
  isSearchResultNote,
} from "@/lib/types/searchTypes";
import SearchResultItem from "./SearchResultItem";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import ProButton from "../ProButton";

interface IntegratedSearchProps {
  onSearch?: (query: string) => void;
}

const IntegratedSearch = (props: IntegratedSearchProps) => {
  const { onSearch } = props;
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    SearchResult | undefined
  >();
  const [searchMode, setSearchMode] = useState<SearchMode>("text");
  const [showNoResults, setShowNoResults] = useState(false);

  /**
   * Mutation to execute the search
   * when it completes, we save the results in local state
   */
  const searchMutation = useSearch({
    onSuccess: (data: SearchResult) => {
      // save the results. Even when no results, we still need to use the 'query' in this payload.
      setSearchResults(data);
    },
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
    searchMutation.mutate({ query, searchMode });
    // add any additional effects passed in from the parent
    if (onSearch) {
      onSearch(query);
    }
    // remove the query
    setQuery("");
  };

  /**
   * Clear the search results
   */
  const handleClearResults = () => {
    setSearchResults(undefined);
  };

  /**
   * Toggles the search mode from 'text' to 'semantic' and back
   */
  const toggleSearchMode = () => {
    setSearchMode((prevMode) => (prevMode === "text" ? "semantic" : "text"));
  };

  /**
   * This use effect handles all of the alerting and alert cleanup when there are no results
   */
  useEffect(() => {
    if (searchResults && searchResults.numResults === 0) {
      // show alert
      setShowNoResults(true);
      // auto-dismiss the alert timer and clear results
      const timer = setTimeout(() => {
        setShowNoResults(false);
        setSearchResults(undefined);
      }, 5000);
      // clean up the timer
      return () => {
        clearTimeout(timer);
      };
    }
  }, [searchResults]);

  return (
    <div className="flex flex-col p-1 border border-input dark:border-white w-full rounded-md focus-visible:ring-1 focus-visible:ring-ring shadow-sm">
      <div className="flex space-x-1">
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
        {/* clear search results button -only shows when there are results */}
        {!!searchResults && (
          <AnimatedListItem animation="fadeIn" index={1}>
            <div>
              <Button
                variant={"ghost"}
                className="text-muted-foreground hover:text-muted-foreground"
                onClick={handleClearResults}
              >
                <XIcon className="h-4 w-4" />
                Clear Results
              </Button>
            </div>
          </AnimatedListItem>
        )}
        {/* the search button */}
        <div className="justify-end">
          <Button
            variant={"ghost"}
            className="text-primary  hover:text-primary dark:text-white dark:hover:text-white"
            onClick={handleSearch}
          >
            {`Search`}
            <CornerDownLeft className="h-4 w-4" />
          </Button>
        </div>
        {/* Search Mode - Semantic Search or Text Matching */}
        <div className="flex items-center justify-center">
          <ProButton
            variant={searchMode === "semantic" ? "default" : "ghost"}
            className={`${searchMode === "text" ? "text-primary" : "text-background"}`}
            icon={<BrainIcon className="h-4 w-4" />}
            onClick={toggleSearchMode}
          />
        </div>
      </div>

      {/* the search results */}
      <AnimatedExpandable
        isOpen={
          searchMutation.isPending ||
          (searchMutation.isSuccess && !!searchResults)
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
        {/* show the items if we get search results */}
        {searchMutation.isSuccess && !!searchResults && (
          <div className="p-2 flex space-x-2">
            {/* if we have more than 0 results, show them */}
            {searchResults.numResults > 0 &&
              searchResults.searchResults
                .filter(isSearchResultNote)
                .map((searchResult) => (
                  <SearchResultItem
                    key={searchResult.note.id}
                    searchResult={searchResult}
                  />
                ))}
            {/* if we have 0 results, notify the user */}
            {showNoResults && searchResults.numResults === 0 && (
              <Alert className="border-none bg-slate-50 dark:bg-slate-800">
                <CircleAlertIcon className="h-4 w-4" />
                <AlertTitle className="text-primary">Nothing Here!</AlertTitle>
                <AlertDescription>{`Your search for ${searchResults.query} did not significantly match any of your notes`}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </AnimatedExpandable>
    </div>
  );
};
export default IntegratedSearch;

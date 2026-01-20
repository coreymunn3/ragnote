"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  CircleAlertIcon,
  CornerDownLeft,
  BrainIcon,
  XIcon,
  MessageSquare,
  Search,
} from "lucide-react";
import { Button } from "../ui/button";
import { useSearch } from "@/hooks/search/useSearch";
import { useChat } from "@/hooks/chat/useChat";
import { AnimatedExpandable, AnimatedListItem } from "../animations";
import { toast } from "sonner";
import SearchResultsSkeleton from "../skeletons/SearchResultsSkeleton";
import {
  SearchMode,
  SearchResult,
  isSearchResultNote,
} from "@/lib/types/searchTypes";
import { ChatScope } from "@/lib/types/chatTypes";
import SearchResultItem from "./SearchResultItem";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import ProButton from "../ProButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";
import ScopeBadge from "../ScopeBadge";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "../ui/tooltip";
import { TypographySmall } from "../ui/typography";

type PrimaryMode = "chat" | "search";

interface CommandBarProps {
  scope: ChatScope;
  scopeId?: string;
  onSearch?: (query: string) => void;
}

const CommandBar = (props: CommandBarProps) => {
  const { scope, scopeId, onSearch } = props;
  const isMobile = useIsMobile();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [primaryMode, setPrimaryMode] = useState<PrimaryMode>("chat");
  const [searchResults, setSearchResults] = useState<
    SearchResult | undefined
  >();
  const [searchMode, setSearchMode] = useState<SearchMode>("text");
  const [showNoResults, setShowNoResults] = useState(false);

  /**
   * Mutation to execute the chat
   * when it completes, navigate to the chat session page
   */
  const chatMutation = useChat({
    onSuccess: (data) => {
      router.push(`/chat/${data.session.id}`);
    },
  });

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
   * Run when the input is submitted
   */
  const handleSubmit = () => {
    // ensure there is text in the input
    if (!(query.trim().length > 0)) {
      toast.info(
        primaryMode === "chat"
          ? "Please enter a message"
          : "Please enter a search query"
      );
      return;
    }

    if (primaryMode === "chat") {
      // Send chat message
      chatMutation.mutate({
        message: query,
        scope: scope,
        scopeId: scopeId,
        sessionId: undefined, // Always create a new session from command bar
      });
      // Clear the query
      setQuery("");
    } else {
      // Execute search
      searchMutation.mutate({ query, searchMode });
      // Add any additional effects passed in from the parent
      if (onSearch) {
        onSearch(query);
      }
      // Clear the query
      setQuery("");
    }
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
    <div className="py-2 bg-background flex flex-col justify-center p-1 border border-input dark:border-primary w-full rounded-md focus-visible:ring-1 focus-visible:ring-ring shadow-sm">
      <div className="flex space-x-1">
        {/* Primary Mode Toggle (Chat/Search) - only show 1 toggle button at a time */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center justify-center">
                {primaryMode === "chat" && (
                  <Button
                    size="sm"
                    variant={"ghost"}
                    onClick={() => {
                      setPrimaryMode("search");
                    }}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                )}
                {primaryMode === "search" && (
                  <Button
                    variant={"ghost"}
                    size="sm"
                    onClick={() => {
                      setPrimaryMode("chat");
                      setSearchResults(undefined); // Clear search results when switching to chat
                    }}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <TypographySmall>{`Toggle to ${primaryMode === "chat" ? "Search" : "Chat"}`}</TypographySmall>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* the input */}
        <Input
          placeholder={
            primaryMode === "chat"
              ? `Chat with ${scope === "global" ? "all your notes" : scope === "folder" ? "this folder" : "this note"}...`
              : "Search Your Notes"
          }
          className="flex-1 border-none resize-none focus:border-none shadow-none focus-visible:ring-0 text-sm placeholder:text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
        />

        {/* clear search results button - only shows when there are search results */}
        {primaryMode === "search" && !!searchResults && (
          <AnimatedListItem animation="fadeIn" index={1}>
            <div>
              <Button
                variant={"ghost"}
                className="text-muted-foreground hover:text-muted-foreground"
                onClick={handleClearResults}
              >
                <XIcon className="h-4 w-4" />
                {!isMobile && "Clear Results"}
              </Button>
            </div>
          </AnimatedListItem>
        )}

        {/* the submit button */}
        <div className="justify-end">
          <Button
            variant={"ghost"}
            className="text-primary hover:text-primary"
            onClick={handleSubmit}
            disabled={chatMutation.isPending}
          >
            <span>
              {!isMobile &&
                (primaryMode === "chat"
                  ? chatMutation.isPending
                    ? "Sending..."
                    : "Send"
                  : "Search")}
            </span>
            <CornerDownLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* after the search bar - controls/info */}
        <div className="flex items-center justify-center w-12">
          {/* Search Mode Toggle - Semantic Search or Text Matching - only show in search mode */}
          {primaryMode === "search" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ProButton
                    variant={searchMode === "semantic" ? "default" : "ghost"}
                    className={`${searchMode === "text" ? "text-primary" : "text-background"}`}
                    icon={<BrainIcon className="h-4 w-4" />}
                    onClick={toggleSearchMode}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <TypographySmall>Toggle AI Semantic Search</TypographySmall>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {/* Scope Badge - only show in chat mode */}
          {primaryMode === "chat" && (
            <div className="flex items-center">
              <ScopeBadge chatScope={scope} />
            </div>
          )}
        </div>
      </div>
      {/* the search results - only show in search mode */}
      <AnimatedExpandable
        isOpen={
          primaryMode === "search" &&
          (searchMutation.isPending || !!searchResults)
        }
      >
        {/* show loading if mutation pending */}
        {searchMutation.isPending && <SearchResultsSkeleton />}
        {/* show the items if we get search results */}
        {!!searchResults && (
          <div className="p-2 flex flex-wrap gap-2">
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
export default CommandBar;

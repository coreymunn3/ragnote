"use client";
import { Button } from "../ui/button";
import { FileIcon } from "lucide-react";

import { SearchResultNote } from "@/lib/types/searchTypes";
import VersionBadge from "../VersionBadge";
import Link from "next/link";
import { TypographyMuted, TypographySmall } from "../ui/typography";

interface SearchResultItemProps {
  searchResult: SearchResultNote;
}

/**
 * Displays a search result with the name, the icon representing the type of item, and the highest ranking version match
 */
const SearchResultItem = ({ searchResult }: SearchResultItemProps) => {
  return (
    <Link href={`/note/${searchResult.note.id}`}>
      <Button
        variant={"outline"}
        className="p-4 bg-slate-100 h-auto w-full max-w-[250px]"
      >
        <div className="flex flex-col space-y-2 w-full min-w-0">
          {/* Header row */}
          <div className="flex items-center justify-start space-x-2 w-full min-w-0">
            <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <TypographySmall className="truncate flex-1 text-start">
              {searchResult.note.title}
            </TypographySmall>
            <VersionBadge version={searchResult.versions[0]} />
          </div>

          {/* Preview */}
          <div className="w-full min-w-0">
            <TypographyMuted className="truncate">
              {searchResult.note.preview}
            </TypographyMuted>
          </div>
        </div>
      </Button>
    </Link>
  );
};
export default SearchResultItem;

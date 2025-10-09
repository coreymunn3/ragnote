import {
  SearchResult,
  SearchResultNote,
  SearchResultVersion,
  PrismaTextSearchResult,
  SearchResultItem,
} from "@/lib/types/searchTypes";

/**
 * Generate preview text from plain text content (similar to getNotePreview logic)
 */
const generatePreview = (plainText: string): string => {
  if (!plainText || plainText.trim().length === 0) {
    return "No content available";
  }

  // Trim to approximately 100 characters at word boundary
  if (plainText.length > 100) {
    const truncated = plainText.substring(0, 100);
    const lastSpaceIndex = truncated.lastIndexOf(" ");
    return lastSpaceIndex > 50
      ? truncated.substring(0, lastSpaceIndex) + "..."
      : truncated + "...";
  }

  return plainText;
};

export const transformTextSearchResults = async (
  query: string,
  prismaResults: PrismaTextSearchResult[]
): Promise<SearchResult> => {
  const searchResults: SearchResultNote[] = prismaResults.map(
    (prismaResult) => {
      // Generate preview from plain text content
      const preview = generatePreview(
        prismaResult.current_version.plain_text_content
      );

      // Create Note object from Prisma result
      const note = {
        id: prismaResult.id,
        folder_id: prismaResult.folder_id || "root", // Handle null folder_id
        title: prismaResult.title,
        current_version: {
          id: prismaResult.current_version.id,
          updated_at: prismaResult.updated_at,
          version_number: prismaResult.current_version.version_number,
          is_published: prismaResult.current_version.is_published,
          published_at: prismaResult.current_version.published_at,
        },
        is_pinned: prismaResult.is_pinned,
        is_deleted: prismaResult.is_deleted,
        updated_at: prismaResult.updated_at,
        created_at: prismaResult.created_at,
        shared_with_count: prismaResult._count.permissions,
        preview,
      };

      // Create SearchResultVersion with score = 1 for text search
      const searchResultVersion: SearchResultVersion = {
        id: prismaResult.current_version.id,
        version_number: prismaResult.current_version.version_number,
        is_published: prismaResult.current_version.is_published,
        published_at: prismaResult.current_version.published_at,
        score: 1, // Fixed score for text search
      };

      // Create SearchResultNote with minimal BaseSearchResultItem properties
      const searchResultNote: SearchResultNote = {
        // BaseSearchResultItem properties
        type: "note",
        score: 1, // Note-level score (same as version score for text search)
        folderId: prismaResult.folder?.id || "root",
        folderName: prismaResult.folder?.folder_name || "Root",
        // SearchResultNote-specific properties
        note,
        versions: [searchResultVersion], // Only current version for free users
      };

      return searchResultNote;
    }
  );

  return {
    query,
    numResults: searchResults.length,
    searchResults,
  };
};

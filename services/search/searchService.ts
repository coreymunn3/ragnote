import { prisma } from "@/lib/prisma";
import {
  SearchResult,
  PrismaTextSearchResult,
  SearchResultItem,
} from "@/lib/types/searchTypes";
import { searchSchema, textBasedSearchSchema } from "./searchValidators";
import { transformTextSearchResults } from "./searchTransformers";
import { AiService } from "../ai/aiService";

export class SearchService {
  /**
   * Main search method - determines whether to use semantic or text-based search
   */
  async search(params: {
    query: string;
    userId: string;
  }): Promise<SearchResult> {
    // Validate inputs
    const validatedParams = searchSchema.parse(params);
    const { query, userId } = validatedParams;

    // Create AI service instance to check for embeddings
    const aiService = new AiService(userId);

    // Check if user has embeddings to determine search type
    const hasEmbeddings = await aiService.checkUserHasEmbeddings(userId);

    if (hasEmbeddings) {
      // Use semantic search for pro users with embeddings
      return await aiService.semanticSearch(query, userId);
    } else {
      // Use text-based search for free users or pro users who haven't published yet
      return await this.textBasedSearch({ query, userId });
    }
  }

  /**
   * Text-based search for users without embeddings
   */
  private async textBasedSearch(params: {
    query: string;
    userId: string;
  }): Promise<SearchResult> {
    // Validate inputs
    const validatedParams = textBasedSearchSchema.parse(params);
    const { query, userId } = validatedParams;

    try {
      // Single Prisma query to get everything we need (1 query vs 100+ queries!)
      const prismaResults = (await prisma.note.findMany({
        where: {
          user_id: userId,
          is_deleted: false,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            {
              current_version: {
                plain_text_content: { contains: query, mode: "insensitive" },
              },
            },
          ],
        },
        include: {
          current_version: {
            select: {
              id: true,
              version_number: true,
              is_published: true,
              published_at: true,
              plain_text_content: true, // Need this for preview generation
            },
          },
          folder: {
            select: {
              id: true,
              folder_name: true,
            },
          },
          _count: {
            select: {
              permissions: { where: { active: true } },
            },
          },
        },
        orderBy: { updated_at: "desc" },
        take: 10, // Limited to 10 results for performance
      })) as PrismaTextSearchResult[];

      // Transform Prisma results to SearchResult format
      const searchResult = await transformTextSearchResults(
        query,
        prismaResults
      );

      return searchResult;
    } catch (error) {
      console.error("Text-based search failed:", error);
      throw new Error(`Text-based search failed: ${error}`);
    }
  }
}

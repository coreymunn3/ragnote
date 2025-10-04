import { PGVectorStore } from "@llamaindex/postgres";
import { MetadataFilters, VectorStoreIndex } from "llamaindex";

/**
 * Creates a configured VectorStoreIndex for the given user
 * @param userId - The user ID to set as the collection
 * @returns Promise<VectorStoreIndex> - Configured vector store index
 */
export const createVectorStoreIndex = async (
  userId: string
): Promise<VectorStoreIndex> => {
  // Setup the vector store with common configuration
  const vectorStore = new PGVectorStore({
    clientConfig: {
      connectionString: process.env.DATABASE_URL,
    },
    tableName: "llamaindex_embedding",
    performSetup: false,
    dimensions: 1536,
  });

  // Limit the vector store to only search this user's collection of notes
  vectorStore.setCollection(userId);

  // Create and return the index
  const index = await VectorStoreIndex.fromVectorStore(vectorStore);

  return index;
};

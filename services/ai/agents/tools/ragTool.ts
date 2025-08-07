import { ChatScopeObject } from "@/lib/types/chatTypes";
import { PGVectorStore } from "@llamaindex/postgres";
import { similarity, tool, VectorStoreIndex } from "llamaindex";
import { z } from "zod";
import { ChatScopeFilter } from "./chatScopeFilter";

export const createRagTool = async (
  userId: string,
  chatScope: ChatScopeObject
) => {
  const vectorStore = new PGVectorStore({
    clientConfig: {
      connectionString: process.env.DATABASE_URL,
    },
    tableName: "llamaindex_embedding",
    performSetup: false,
    dimensions: 1536,
  });
  // limit the vector store to only search this user's collection of notes
  vectorStore.setCollection(userId);

  // create the filters
  const chatScopeFIlters = new ChatScopeFilter(userId, chatScope);
  const filters = await chatScopeFIlters.buildFilters();

  // create an index and retriever
  const index = await VectorStoreIndex.fromVectorStore(vectorStore);

  return index.queryTool({
    metadata: {
      name: "search_notes",
      description:
        "Search through the users notes to find relevant information and answer questions. This tool enables retrieval augmented generation.",
    },
    options: {
      similarityTopK: 5,
      filters: filters,
    },
  });
};

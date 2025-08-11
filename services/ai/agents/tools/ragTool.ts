import { ChatScopeObject } from "@/lib/types/chatTypes";
import { PGVectorStore } from "@llamaindex/postgres";
import { MetadataFilters, VectorStoreIndex } from "llamaindex";

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
  const vectorStoreFilters = await createVectorStoreFilters(chatScope);

  // create an index and retriever
  const index = await VectorStoreIndex.fromVectorStore(vectorStore);

  return index.queryTool({
    metadata: {
      name: "search_notes",
      description:
        "Search through the user's notes to find specific information, facts, details, or content that can help answer questions. Use this tool when the user is asking about something that might be contained in their notes, needs specific information retrieved, or wants to find relevant content. This tool performs semantic search across note content.",
    },
    options: {
      similarityTopK: 5,
      filters: vectorStoreFilters,
    },
    // setting to true will return source nodes used and their scores
    includeSourceNodes: false,
  });
};

const createVectorStoreFilters = async (
  scope: ChatScopeObject
): Promise<MetadataFilters | undefined> => {
  if (scope.scope === "note") {
    const versionIds = scope.noteVersions.map((version) => version.versionId);
    return {
      filters: [
        {
          key: "note_version_id",
          operator: "in",
          value: versionIds,
        },
      ],
    };
  }
  // TO DO
  // else if (this.chatScope.scope === "folder") {
  // Get most recent published versions for notes in this folder
  // const validVersionIds = await this.getMostRecentPublishedVersionIds(
  //   this.userId,
  //   this.chatScope.scopeId
  // );
  // return {
  //   filters: {
  //     metadata: {
  //       note_version_id: { $in: validVersionIds },
  //       folder_id: this.chatScope.scopeId
  //     }
  //   }
  // };
  // }

  // TO DO
  // else if (this.chatScope.scope === 'global') {
  //   // Get most recent published versions for all user's notes
  //   const validVersionIds = await this.getMostRecentPublishedVersionIds(userId);

  //   return {
  //     filters: {
  //       metadata: {
  //         note_version_id: { $in: validVersionIds }
  //       }
  //     }
  //   };
  // }
};

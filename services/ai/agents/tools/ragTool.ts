import { ChatScopeObject } from "@/lib/types/chatTypes";
import { MetadataFilters } from "llamaindex";
import { createVectorStoreIndex } from "../utils/vectorStoreUtils";

export const createRagTool = async (
  userId: string,
  chatScope: ChatScopeObject
) => {
  // create an index using the utility
  const index = await createVectorStoreIndex(userId);
  // create the filters
  const vectorStoreFilters = await createVectorStoreFilters(chatScope);
  // create the query tool
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
  // get the versionIds from the scope. This is the source of truth for the agent's abilities
  const versionIds = scope.noteVersions.map((version) => version.versionId);
  if (versionIds.length === 0) {
    return undefined;
  }
  // for any scope, we will just be looking at the note version ID's. that governs the content that is in-scope
  return {
    filters: [
      {
        key: "note_version_id",
        operator: "in",
        value: versionIds,
      },
    ],
  };
};

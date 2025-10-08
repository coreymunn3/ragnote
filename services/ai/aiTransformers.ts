import {
  CustomNodeMetadata,
  SearchResultNote,
  SearchResultVersion,
} from "@/lib/types/aiTypes";
import { Metadata, NodeWithScore } from "llamaindex";
import { NoteService } from "../note/noteService";
import { FolderService } from "../folder/folderService";

export const transformNodesToSearchResult = async (
  retrievedNodes: NodeWithScore<Metadata>[],
  userId: string
): Promise<SearchResultNote[]> => {
  const noteService = new NoteService();
  const folderService = new FolderService();

  // Step 1: Group nodes by note ID
  const groupedByNote: { [noteId: string]: NodeWithScore<Metadata>[] } = {};
  retrievedNodes.forEach((node) => {
    const noteId = (node.node.metadata as CustomNodeMetadata).note_id;
    if (!(noteId in groupedByNote)) {
      groupedByNote[noteId] = [];
    }
    groupedByNote[noteId].push(node);
  });

  const searchResult: SearchResultNote[] = [];

  for (let [noteId, noteNodes] of Object.entries(groupedByNote)) {
    // Step 2: Within each note, group by version ID to handle multiple chunks per version
    const groupedByVersion: { [versionId: string]: NodeWithScore<Metadata>[] } =
      {};
    noteNodes.forEach((node) => {
      const versionId = (node.node.metadata as CustomNodeMetadata)
        .note_version_id;
      if (!(versionId in groupedByVersion)) {
        groupedByVersion[versionId] = [];
      }
      groupedByVersion[versionId].push(node);
    });

    // Get note and folder data
    const note = await noteService.getNoteById({ noteId, userId });
    const folder = await folderService.getFolderById(note.folder_id, userId);

    // Step 3: Create SearchResultVersion for each unique version
    const searchResultVersions: SearchResultVersion[] = [];

    for (let [versionId, versionNodes] of Object.entries(groupedByVersion)) {
      // Get version data once per version (not once per chunk)
      const noteVersion = await noteService.getNoteVersion({
        versionId,
        userId,
      });

      // Determine version-level score from multiple chunks (use max for best relevance)
      const versionScore = Math.max(...versionNodes.map((n) => n.score ?? 0));

      searchResultVersions.push({
        id: noteVersion.id,
        version_number: noteVersion.version_number,
        is_published: noteVersion.is_published,
        published_at: noteVersion.published_at,
        created_at: noteVersion.created_at,
        score: versionScore,
      });
    }

    if (searchResultVersions.length === 0) {
      throw new Error(
        `Semantic Search Transformation Error - No valid versions found for note ${noteId} given retrieved nodes`
      );
    }

    // Step 4: Sort versions by score and calculate note-level score
    // Since only published versions are embedded and searchable, we simply
    // sort all matching versions by score (highest first)
    const sortedVersions = searchResultVersions.sort(
      (a, b) => (b.score ?? 0) - (a.score ?? 0)
    );

    const noteScore = sortedVersions[0]?.score ?? 0;

    // Build final result with note-level score
    searchResult.push({
      note,
      folderId: folder.id,
      folderName: folder.folder_name,
      versions: sortedVersions, // All matching versions sorted by score
      score: noteScore, // Note-level score for sorting (highest version score)
    });
  }

  // Step 5: Sort by note-level score (highest first)
  return searchResult.sort((a, b) => b.score - a.score);
};

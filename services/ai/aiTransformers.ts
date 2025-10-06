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
  // console.log("metadata", retrievedNodes[0].node.metadata);
  // group nodes (version) by note ID
  const groupedNodes: { [key: string]: NodeWithScore<Metadata>[] } = {};

  retrievedNodes.forEach((node) => {
    // extract the node Id
    const noteId = (node.node.metadata as CustomNodeMetadata).note_id;
    // push it to the object
    if (!(noteId in groupedNodes)) {
      groupedNodes[noteId] = [];
    }
    groupedNodes[noteId].push(node);
  });

  // create the final retuned object
  const searchResult: SearchResultNote[] = [];

  // TODO
  // - get note title & current version, folder name
  // - get the curernt and other version of the note
  for (let [noteId, nodes] of Object.entries(groupedNodes)) {
    // get the note data
    const note = await noteService.getNoteById({ noteId, userId });
    // get the folder data
    const folder = await folderService.getFolderById(note.folder_id, userId);
    // map through nodes creating the search result version
    const searchResultNoteVersions = await Promise.all(
      nodes.map(async ({ node, score }) => {
        const noteVersion = await noteService.getNoteVersion({
          versionId: (node.metadata as CustomNodeMetadata).note_version_id,
          userId,
        });
        return {
          id: noteVersion.id,
          version_number: noteVersion.version_number,
          is_published: noteVersion.is_published,
          published_at: noteVersion.published_at,
          created_at: noteVersion.created_at,
          score: score!,
        };
      })
    );

    if (searchResultNoteVersions.length === 0) {
      throw new Error(
        `Semantic Search Transformation Error - No valid versions found for note ${noteId} given retrieved nodes`
      );
    }

    let displayedVersion: SearchResultVersion;
    let additionalVersions: SearchResultVersion[] = [];

    const currentVersionInResults = searchResultNoteVersions.find(
      (nv) => nv.id === note.current_version.id
    );
    // figure out which version is the display version
    if (currentVersionInResults) {
      // Use current version as display if it is in results
      displayedVersion = currentVersionInResults;
      additionalVersions = searchResultNoteVersions.filter(
        (nv) => nv.id !== note.current_version.id
      );
    } else {
      // Use highest scoring version as display if current version not in results
      const sortedByScore = searchResultNoteVersions.sort(
        (a, b) => (b.score ?? 0) - (a.score ?? 0)
      );
      displayedVersion = sortedByScore[0];
      additionalVersions = sortedByScore.slice(1);
    }

    // build final result
    searchResult.push({
      note,
      folderId: folder.id,
      folderName: folder.folder_name,
      displayedVersion,
      additionalVersions,
    });
  }
  return searchResult;
};

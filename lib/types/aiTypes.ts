import { Note, NoteVersionWithoutContent } from "./noteTypes";
import { Expand } from "./sharedTypes";

export type EmbeddedChunks = {
  success: boolean;
  chunksCreated: number;
  chunks: number[];
};

export type OpenAIUsage = {
  prompt_tokens: number;
  completion_tokens?: number;
  total_tokens: number;
};

export type OpenAIResponse = {
  usage?: OpenAIUsage;
  model?: string;
};

export type CustomNodeMetadata = {
  chunk_index: number;
  folder_id: string;
  note_id: string;
  note_title: string;
  note_version_id: string;
};

export type SearchResultVersion = Expand<
  NoteVersionWithoutContent & {
    score: number | undefined;
  }
>;

export type SearchResultNote = {
  note: Note;
  folderId: string;
  folderName: string;
  versions: SearchResultVersion[]; // All matching versions sorted by score (highest first)
  score: number; // Highest score among all versions of this note for sorting
};

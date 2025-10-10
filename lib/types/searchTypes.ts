import { Note, NoteVersionWithoutContent } from "./noteTypes";
import { Expand } from "./sharedTypes";

// Base search result item that all content types will extend - minimal and generic
export type BaseSearchResultItem = {
  type: "note" | "file"; // Discriminated union key
  score: number; // Search relevance score
  folderId: string; // Folder location
  folderName: string; // Folder display name
};

// Note-specific result with versions
export type SearchResultNote = BaseSearchResultItem & {
  type: "note";
  note: Note; // Contains id, title, preview, dates, etc.
  versions: SearchResultVersion[]; // All matching versions sorted by score (highest first)
};

// Future file result (placeholder for V2)
export type SearchResultFile = BaseSearchResultItem & {
  type: "file";
  fileId: string;
  filename: string;
  fileType: string; // pdf, docx, etc.
  fileSize: number;
  uploadedBy: string;
  originalName: string;
  preview: string;
  updated_at: Date;
  created_at: Date;
  shared_with_count: number;
  // Add other file-specific metadata here in V2
};

// Union type for all possible search result items
export type SearchResultItem = SearchResultNote | SearchResultFile;

export type SearchResultVersion = Expand<
  NoteVersionWithoutContent & {
    score: number | undefined;
  }
>;

export type PrismaTextSearchResult = {
  id: string;
  title: string;
  folder_id: string | null;
  is_pinned: boolean;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  current_version: {
    id: string;
    version_number: number;
    is_published: boolean;
    published_at: Date | null;
    plain_text_content: string;
  };
  folder: {
    id: string;
    folder_name: string;
  } | null;
  _count: {
    permissions: number;
  };
};

export type SearchMode = "text" | "semantic";

// Generic search result that can contain mixed content types
export type SearchResult = {
  query: string;
  numResults: number;
  searchResults: SearchResultItem[]; // Now supports both notes and files
};

// Type guards for distinguishing between result types
export const isSearchResultNote = (
  item: SearchResultItem
): item is SearchResultNote => {
  return item.type === "note";
};

export const isSearchResultFile = (
  item: SearchResultItem
): item is SearchResultFile => {
  return item.type === "file";
};

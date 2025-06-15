import { Note } from "./noteTypes";

export type Folder = {
  id: string;
  folder_name: string;
  link: string;
  notes: Note[];
};

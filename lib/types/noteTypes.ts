export type Note = {
  id: string;
  title: string;
  current_version: {
    id: string;
    version_number: number;
    is_published: boolean;
    published_at: Date | null;
  };
  is_pinned: boolean;
  is_deleted: boolean;
  updated_at: Date;
  created_at: Date;
  shared_with_count: number;
};

export type NoteVersion = {
  id: string;
  version_number: number;
  is_published: boolean;
  published_at: Date;
  created_at: Date;
};

export type NoteVersionWithContent = NoteVersion & {
  content: any;
};

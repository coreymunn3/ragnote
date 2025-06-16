export type Note = {
  id: string;
  title: string;
  current_version: {
    id: string;
    version_number: number;
    is_published: Boolean;
    published_at: Date | null;
  };
  is_pinned: Boolean;
  is_deleted: Boolean;
  updated_at: Date;
  created_at: Date;
  shared_with_count: number;
};

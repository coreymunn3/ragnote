export type Conversation = {
  id: string;
  title: string;
  is_pinned: boolean;
  is_deleted: boolean;
  updated_at: Date;
  created_at: Date;
  messages_count: number;
};

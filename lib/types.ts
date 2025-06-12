import { DateTime } from "luxon";

export interface ClerkWebhookEvent {
  type: string;
  timestamp: number;
  data: ClerkWebhookEventData;
}

// Base interface with only id which is common to all event types
interface ClerkWebhookEventDataBase {
  id: string;
}

// Full user data for create and update events
interface ClerkWebhookEventDataFull extends ClerkWebhookEventDataBase {
  username?: string | null;
  email_addresses: { email_address: string }[];
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
  birthday?: string;
  created_at: number;
}

// Union type to handle different event data structures
type ClerkWebhookEventData =
  | ClerkWebhookEventDataBase
  | ClerkWebhookEventDataFull;

export type Folder = {
  id: string;
  folder_name: string;
  notes: Note[];
};

export type Note = {
  id: string;
  title: string;
  current_version: {
    version_number: number;
    is_published: Boolean;
    published_at: Date | null;
  };
  updated_at: Date;
  created_at: Date;
  shared_with_count: number;
};

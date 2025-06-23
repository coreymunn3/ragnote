import { z } from "zod";

export const createNoteSchema = z.object({
  userId: z.string().uuid(),
  folderId: z.string().uuid().optional(),
  title: z.string().min(1, "Title cannot be empty").max(255),
  content: z.string().min(0), // Initial content can be empty
});

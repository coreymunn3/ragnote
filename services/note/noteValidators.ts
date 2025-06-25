import { z } from "zod";

export const createNoteSchema = z.object({
  userId: z.string().uuid(),
  folderId: z.string().uuid().optional(),
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(255, "Note name cannot exceed 255 characters")
    .trim()
    .refine((name) => name.length > 0, "Note name cannot be just whitespace"),
  content: z.string().min(0), // Initial content can be empty
});

export const getNotesInFolderSchema = z.object({
  userId: z.string().uuid(),
  folderId: z.string().uuid(),
});

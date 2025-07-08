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
});

export const getNotesInFolderSchema = z.object({
  userId: z.string().uuid(),
  folderId: z.string().min(1), // not UUID to allow for system folders "system:shared", "system:deleted", etc
});

export const getSystemNotesSchema = z.object({
  userId: z.string().uuid(),
});

export const togglePinNoteSchema = z.object({
  noteId: z.string().uuid(),
  userId: z.string().uuid(),
});

export const moveNoteSchema = z.object({
  noteId: z.string().uuid(),
  folderId: z.string().uuid(),
  userId: z.string().uuid(),
});

export const deleteNoteSchema = z.object({
  noteId: z.string().uuid(),
  userId: z.string().uuid(),
});

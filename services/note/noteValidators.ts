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

export const userIdSchema = z.object({
  userId: z.string().uuid(),
});

export const getNotesInFolderSchema = z.object({
  userId: z.string().uuid(),
  folderId: z.string().min(1), // not UUID to allow for system folders "system_shared", "system_deleted", etc
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

export const softDeleteNoteSchema = z.object({
  noteId: z.string().uuid(),
  userId: z.string().uuid(),
});

export const updateNoteVersionContentSchema = z.object({
  versionId: z.string().uuid(),
  richTextContent: z.any(), // not really sure how to do this
  userId: z.string().uuid(),
});

export const getNoteContentSchema = z.object({
  versionId: z.string().uuid(),
  userId: z.string().uuid(),
});

export const getNoteSchema = z.object({
  noteId: z.string().uuid(),
  userId: z.string().uuid(),
  includeDeleted: z.boolean().optional(),
});

export const updateNoteTitleSchema = z.object({
  noteId: z.string().uuid(),
  userId: z.string().uuid(),
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(255, "Note title cannot exceed 255 characters")
    .trim()
    .refine(
      (title) => title.length > 0,
      "Note title cannot be just whitespace"
    ),
});

export const getNoteVersionsSchema = z.object({
  noteId: z.string().uuid(),
  userId: z.string().uuid(),
});

export const getNoteVersionSchema = z.object({
  versionId: z.string().uuid(),
  userId: z.string().uuid(),
});

export const publishNoteVersionSchema = z.object({
  versionId: z.string().uuid(),
  userId: z.string().uuid(),
});

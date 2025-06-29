import { z } from "zod";

export const createFolderSchema = z.object({
  userId: z.string().uuid(),
  folderName: z
    .string()
    .min(1, "Folder name cannot be empty")
    .max(255, "Folder name cannot exceed 255 characters")
    .trim()
    .refine((name) => name.length > 0, "Folder name cannot be just whitespace"),
});

export const renameFolderSchema = z.object({
  userId: z.string().uuid(),
  folderId: z.string().min(1, "Folder ID is required"),
  newFolderName: z
    .string()
    .min(1, "Folder name cannot be empty")
    .max(255, "Folder name cannot exceed 255 characters")
    .trim()
    .refine((name) => name.length > 0, "Folder name cannot be just whitespace"),
});

export const getFolderByIdSchema = z.object({
  folderId: z.string().min(1, "Folder ID is required"),
  userId: z.string().uuid("Invalid user ID format"),
});

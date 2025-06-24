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

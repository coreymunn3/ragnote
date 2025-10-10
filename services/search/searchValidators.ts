import { z } from "zod";

export const searchSchema = z.object({
  query: z
    .string()
    .min(1, "Search query cannot be empty")
    .max(100, "Search query cannot exceed 100 characters")
    .trim()
    .refine(
      (query) => query.length > 0,
      "Search query cannot be just whitespace"
    ),
  intendedMode: z.enum(["text", "semantic"]),
  userId: z.string().uuid(),
});

export const textBasedSearchSchema = z.object({
  query: z
    .string()
    .min(1, "Search query cannot be empty")
    .max(100, "Search query cannot exceed 100 characters")
    .trim()
    .refine(
      (query) => query.length > 0,
      "Search query cannot be just whitespace"
    ),
  userId: z.string().uuid(),
});

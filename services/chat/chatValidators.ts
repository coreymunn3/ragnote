import { object, z } from "zod";

export const createChatScopeSchema = z.object({
  userId: z.string().uuid(),
  scope: z.union([z.literal("note"), z.literal("folder"), z.literal("global")]),
  noteId: z.string().uuid().optional(),
  folderId: z.string().uuid().optional(),
});

export const getChatSessionSchema = z.object({
  userId: z.string().uuid(),
  sessionId: z.string().uuid(),
});

export const getChatMessagesSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string().uuid(),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
});

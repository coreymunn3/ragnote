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

export const getChatSessionForUserSchema = z.object({
  userId: z.string().uuid(),
});

export const getChatMessagesForSessionSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string().uuid(),
  limit: z.number().int().min(1).max(100).optional().default(50),
  offset: z.number().int().min(0).optional().default(0),
});

export const createChatMessageSchema = z.object({
  sessionId: z.string().uuid(),
  sender: z.union([z.literal("USER"), z.literal("AI")]),
  message: z
    .string()
    .min(1, "Message must contain at least 1 character")
    .trim()
    .refine((message) => message.length > 0, "Message cannot be whitespace."),
  llmResponse: z.any().optional(),
  llmSources: z.any().optional(),
});

export const sendChatSchema = z.object({
  userId: z.string().uuid(),
  message: z
    .string()
    .min(1, "Message must contain at least 1 character")
    .trim()
    .refine((message) => message.length > 0, "Message cannot be whitespace."),
  scope: z.union([z.literal("note"), z.literal("folder"), z.literal("global")]),
  noteId: z.string().uuid().optional(),
  folderId: z.string().uuid().optional(),
  sessionId: z.string().optional(),
});

export const getChatSessionsForNoteSchema = z.object({
  userId: z.string().uuid(),
  noteId: z.string().uuid(),
});

export const updateChatSessionTitleSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().optional(),
});

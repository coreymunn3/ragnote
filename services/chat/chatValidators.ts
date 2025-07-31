import { object, z } from "zod";

export const createChatScopeSchema = z.object({
  userId: z.string().uuid(),
  scope: z.union([z.literal("note"), z.literal("folder"), z.literal("global")]),
  noteId: z.string().uuid().optional(),
  folderId: z.string().uuid().optional(),
});

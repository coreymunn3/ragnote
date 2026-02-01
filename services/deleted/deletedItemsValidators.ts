import { z } from "zod";

export const getDeletedItemsSchema = z.object({
  userId: z.string().uuid(),
});

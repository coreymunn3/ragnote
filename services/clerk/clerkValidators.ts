import { z } from "zod";

export const createUserFromClerkSchema = z.object({
  clerkId: z.string(),
  email: z.string().email(),
  username: z.string().nullable().optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
});

export const updateUserFromClerkSchema = z.object({
  clerkId: z.string(),
  email: z.string().email(),
  username: z.string().nullable().optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
});

export const softDeleteUserFromClerkSchema = z.object({
  clerkId: z.string(),
});

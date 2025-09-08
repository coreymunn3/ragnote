import { z } from "zod";

export const recordTokenUsageSchema = z.object({
  userId: z.string().uuid(),
  modelName: z.string().min(1, "Model name is required"),
  operationType: z.union([
    z.literal("CHAT_COMPLETION"),
    z.literal("EMBEDDING"),
    z.literal("TITLE_GENERATION"),
  ]),
  promptTokens: z.number().int().min(0, "Prompt tokens must be non-negative"),
  completionTokens: z
    .number()
    .int()
    .min(0, "Completion tokens must be non-negative")
    .nullable(),
  totalTokens: z.number().int().min(0, "Total tokens must be non-negative"),
  chatMessageId: z.string().uuid().optional().nullable(),
  chatSessionId: z.string().uuid().optional().nullable(),
  noteVersionId: z.string().uuid().optional().nullable(),
});

export const recordTokenUsageFromOpenAISchema = z.object({
  userId: z.string().uuid(),
  modelName: z.string().min(1, "Model name is required"),
  operationType: z.union([
    z.literal("CHAT_COMPLETION"),
    z.literal("EMBEDDING"),
    z.literal("TITLE_GENERATION"),
  ]),
  usage: z.object({
    prompt_tokens: z
      .number()
      .int()
      .min(0, "Prompt tokens must be non-negative"),
    completion_tokens: z
      .number()
      .int()
      .min(0, "Completion tokens must be non-negative")
      .optional(),
    total_tokens: z.number().int().min(0, "Total tokens must be non-negative"),
    prompt_tokens_details: z
      .object({
        cached_tokens: z.number().int().min(0).optional(),
        audio_tokens: z.number().int().min(0).optional(),
      })
      .optional(),
    completion_tokens_details: z
      .object({
        reasoning_tokens: z.number().int().min(0).optional(),
        audio_tokens: z.number().int().min(0).optional(),
        accepted_prediction_tokens: z.number().int().min(0).optional(),
        rejected_prediction_tokens: z.number().int().min(0).optional(),
      })
      .optional(),
  }),
  chatMessageId: z.string().uuid().optional().nullable(),
  chatSessionId: z.string().uuid().optional().nullable(),
  noteVersionId: z.string().uuid().optional().nullable(),
});

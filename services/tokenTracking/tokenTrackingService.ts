import { prisma } from "@/lib/prisma";
import { withErrorHandling } from "@/lib/errors/errorHandlers";
import {
  TokenUsageLog,
  OpenAIUsageData,
  LLMOperationType,
} from "@/lib/types/tokenTypes";
import { transformToTokenUsageLog } from "./tokenTrackingTransformers";
import {
  recordTokenUsageSchema,
  recordTokenUsageFromOpenAISchema,
} from "./tokenTrackingValidators";

export class TokenTrackingService {
  /**
   * Record token usage to database
   */
  public recordTokenUsage = withErrorHandling(
    async (params: {
      userId: string;
      modelName: string;
      operationType: LLMOperationType;
      promptTokens: number;
      completionTokens: number | null;
      totalTokens: number;
      chatMessageId?: string | null;
      chatSessionId?: string | null;
      noteVersionId?: string | null;
    }): Promise<TokenUsageLog> => {
      const validatedData = recordTokenUsageSchema.parse(params);

      const record = await prisma.llm_usage_log.create({
        data: {
          user_id: validatedData.userId,
          model_name: validatedData.modelName,
          operation_type: validatedData.operationType,
          prompt_tokens: validatedData.promptTokens,
          completion_tokens: validatedData.completionTokens,
          total_tokens: validatedData.totalTokens,
          chat_message_id: validatedData.chatMessageId || null,
          chat_session_id: validatedData.chatSessionId || null,
          note_version_id: validatedData.noteVersionId || null,
        },
      });

      return transformToTokenUsageLog(record);
    }
  );

  /**
   * Record token usage from OpenAI response
   */
  public recordTokenUsageFromOpenAI = withErrorHandling(
    async (params: {
      userId: string;
      modelName: string;
      operationType: LLMOperationType;
      usage: OpenAIUsageData;
      chatMessageId?: string | null;
      chatSessionId?: string | null;
      noteVersionId?: string | null;
    }): Promise<TokenUsageLog> => {
      const validatedData = recordTokenUsageFromOpenAISchema.parse(params);

      return this.recordTokenUsage({
        userId: validatedData.userId,
        modelName: validatedData.modelName,
        operationType: validatedData.operationType,
        promptTokens: validatedData.usage.prompt_tokens,
        completionTokens: validatedData.usage.completion_tokens || null,
        totalTokens: validatedData.usage.total_tokens,
        chatMessageId: validatedData.chatMessageId,
        chatSessionId: validatedData.chatSessionId,
        noteVersionId: validatedData.noteVersionId,
      });
    }
  );

  /**
   * Update an existing token usage record
   * Used for two-phase recording when chatMessageId is available later
   */
  public updateTokenRecord = withErrorHandling(
    async (params: {
      recordId: string;
      chatMessageId?: string;
      chatSessionId?: string;
      noteVersionId?: string;
    }): Promise<TokenUsageLog> => {
      const { recordId, chatMessageId, chatSessionId, noteVersionId } = params;

      const record = await prisma.llm_usage_log.update({
        where: { id: recordId },
        data: {
          ...(chatMessageId !== undefined && {
            chat_message_id: chatMessageId,
          }),
          ...(chatSessionId !== undefined && {
            chat_session_id: chatSessionId,
          }),
          ...(noteVersionId !== undefined && {
            note_version_id: noteVersionId,
          }),
        },
      });

      return transformToTokenUsageLog(record);
    }
  );

  /**
   * Calculate token count for embedding operations using simple character-based estimation
   * Uses ~4 characters per token estimation which is reasonable for cost tracking
   */
  public calculateEmbeddingTokens(text: string): number {
    // Simple estimation: ~4 characters per token for OpenAI models
    return Math.ceil(text.length / 4);
  }
}

// Create and export shared instance
const tokenTrackingService = new TokenTrackingService();
export { tokenTrackingService };

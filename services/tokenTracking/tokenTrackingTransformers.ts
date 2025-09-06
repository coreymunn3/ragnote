import {
  TokenUsageLog,
  PrismaTokenUsageLog,
  LLMOperationType,
} from "@/lib/types/tokenTypes";

/**
 * Transform Prisma result to application type
 */
export const transformToTokenUsageLog = (
  record: PrismaTokenUsageLog
): TokenUsageLog => {
  return {
    id: record.id,
    user_id: record.user_id,
    model_name: record.model_name,
    operation_type: record.operation_type as LLMOperationType,
    prompt_tokens: record.prompt_tokens,
    completion_tokens: record.completion_tokens,
    total_tokens: record.total_tokens,
    chat_message_id: record.chat_message_id,
    chat_session_id: record.chat_session_id,
    note_version_id: record.note_version_id,
    created_at: record.created_at.toISOString(),
  };
};

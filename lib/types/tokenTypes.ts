/**
 * LLM Operation Types - matches schema enum
 */
export type LLMOperationType = "CHAT_COMPLETION" | "EMBEDDING";

/**
 * Application Types - used throughout the app
 */
export type TokenUsageLog = {
  id: string;
  user_id: string;
  model_name: string;
  operation_type: LLMOperationType;
  prompt_tokens: number;
  completion_tokens: number | null;
  total_tokens: number;
  chat_message_id: string | null;
  chat_session_id: string | null;
  note_version_id: string | null;
  created_at: string;
};

/**
 * OpenAI API response usage data structure
 */
export type OpenAIUsageData = {
  prompt_tokens: number;
  completion_tokens?: number;
  total_tokens: number;
  prompt_tokens_details?: {
    cached_tokens: number;
    audio_tokens: number;
  };
  completion_tokens_details?: {
    reasoning_tokens: number;
    audio_tokens: number;
    accepted_prediction_tokens: number;
    rejected_prediction_tokens: number;
  };
};

/**
 * LLM callback event data structure
 */
export type LLMEndEventDetail = {
  id: string;
  response: {
    raw?: {
      usage?: OpenAIUsageData;
      model?: string;
    };
    message?: {
      content?: string;
    };
  };
};

/**
 * Prisma Types - full schema-identical prisma objects
 */
export type PrismaTokenUsageLog = {
  id: string;
  user_id: string;
  model_name: string;
  operation_type: string;
  prompt_tokens: number;
  completion_tokens: number | null;
  total_tokens: number;
  chat_message_id: string | null;
  chat_session_id: string | null;
  note_version_id: string | null;
  created_at: Date;
};

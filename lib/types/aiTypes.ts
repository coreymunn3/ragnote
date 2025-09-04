export type EmbeddedChunks = {
  success: boolean;
  chunksCreated: number;
  chunks: number[];
};

export type OpenAIUsage = {
  prompt_tokens: number;
  completion_tokens?: number;
  total_tokens: number;
};

export type OpenAIResponse = {
  usage?: OpenAIUsage;
  model?: string;
};

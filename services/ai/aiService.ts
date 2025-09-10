import { Settings, SentenceSplitter, CallbackManager } from "llamaindex";
import { OpenAIEmbedding, openai } from "@llamaindex/openai";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { PrismaTransaction } from "@/lib/types/sharedTypes";
import { RateLimitError } from "@/lib/errors/apiErrors";
import { ChatScopeObject, ChatMessage } from "@/lib/types/chatTypes";
import { createNoteChatAgent } from "./agents/noteChatAgent";
import { AgentWorkflow } from "@llamaindex/workflow";
import { tokenTrackingService } from "../tokenTracking/tokenTrackingService";
import { OpenAIResponse, EmbeddedChunks } from "@/lib/types/aiTypes";

export class AiService {
  private static readonly SINGLE_CHUNK_THRESHOLD = 500;
  private userId: string;
  private noteVersionId?: string;
  private pendingTokenRecordId?: string;

  constructor(userId: string) {
    this.userId = userId;

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    Settings.embedModel = new OpenAIEmbedding({
      model: "text-embedding-3-small",
      dimensions: 1536,
    });

    Settings.llm = openai({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o",
    });
    // Set up callback manager for token tracking
    const callbackManager = new CallbackManager();

    callbackManager.on("llm-end", async (event) => {
      // console.log("event detail", JSON.stringify(event.detail));
      // Only track if there's usage data available
      const rawResponse = event.detail.response.raw as OpenAIResponse;
      const usage = rawResponse?.usage;
      const messageResponse = event.detail.response.message;
      // try to record based on the usage provided (it may not exist)
      if (usage) {
        try {
          // Phase 1: Record token usage without chatMessageId
          const tokenRecord =
            await tokenTrackingService.recordTokenUsageFromOpenAI({
              userId: this.userId,
              modelName: rawResponse?.model || "gpt-4o",
              operationType: "CHAT_COMPLETION",
              usage: usage,
              chatMessageId: null, // will add later in sendChat
              chatSessionId: null, // will add later in sendChat
              noteVersionId: this.noteVersionId || null,
            });

          // Store the record ID for later update
          this.pendingTokenRecordId = tokenRecord.id;
          // for logging...
          // console.log("📊 Recorded token usage (phase 1):", {
          //   recordId: tokenRecord.id,
          //   model: rawResponse?.model,
          //   tokens: usage.total_tokens,
          // });
        } catch (error) {
          console.error("Token tracking failed in callback manager:", error);
        }
      }
      // otherwise, estimate tokens based on the response message if usage isn't directly available
      else {
        // TO DO - record the estimated token useage based on the response message.
        try {
          const tokenRecord =
            await tokenTrackingService.recordEstimatedTokenUsageFromMessage({
              userId: this.userId,
              modelName: "gpt-4o",
              operationType: "CHAT_COMPLETION",
              imputMessage: "", // we cant get this here...TO DO
              outputMessage: messageResponse.content.toString(),
              chatMessageId: null,
              chatSessionId: null,
              noteVersionId: this.noteVersionId || null,
            });
        } catch (error) {
          console.error("Token tracking failed in callback manager:", error);
        }
      }
    });

    Settings.callbackManager = callbackManager;
  }

  /**
   * Set the note version ID for token tracking context
   */
  public setNoteVersionId(noteVersionId: string): this {
    this.noteVersionId = noteVersionId;
    return this;
  }

  /**
   * Get the pending token record ID from the callback
   */
  public getPendingTokenRecordId(): string | undefined {
    return this.pendingTokenRecordId;
  }

  /**
   * Clear the pending token record ID after processing
   */
  public clearPendingTokenRecord(): void {
    this.pendingTokenRecordId = undefined;
  }

  /**
   * Generate a concise title for a chat session based on the user's initial message
   * Uses a direct OpenAI client to ensure the call is isolated and does not trigger global callbacks.
   * @param userMessage The first message from the user
   * @returns A promise that resolves to a generated title
   */
  public async generateChatTitle(userMessage: string): Promise<string> {
    const GENERATE_TITLE_MODEL = "gpt-4o-mini";
    try {
      // Use a focused prompt to generate a concise title
      const prompt = `Generate a concise, descriptive title (3-8 words) for a chat conversation based on this user's question or topic. Only return the title, no quotes or extra text.

      User message: "${userMessage}"

      Title:`;

      // 1. Create a direct, isolated OpenAI client
      const openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // 2. Make a direct API call
      const response = await openaiClient.chat.completions.create({
        model: GENERATE_TITLE_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 20, // Limit the output for a title
      });

      const title = response.choices[0].message.content || "";
      const usage = response.usage;

      // 3. Record usage with the correct type
      if (usage) {
        await tokenTrackingService.recordTokenUsageFromOpenAI({
          userId: this.userId,
          modelName: GENERATE_TITLE_MODEL,
          operationType: "TITLE_GENERATION",
          usage: {
            prompt_tokens: usage.prompt_tokens,
            completion_tokens: usage.completion_tokens,
            total_tokens: usage.total_tokens,
          },
        });
      }

      // Clean up the response - remove quotes and trim whitespace
      let cleanedTitle = title.trim();
      cleanedTitle = cleanedTitle.replace(/^["']|["']$/g, ""); // Remove surrounding quotes
      cleanedTitle = cleanedTitle.replace(/^Title:\s*/i, ""); // Remove "Title:" prefix if present

      // Limit title length and ensure it's reasonable
      if (cleanedTitle.length > 60) {
        cleanedTitle = cleanedTitle.substring(0, 60) + "...";
      }

      // Fallback if title is empty or too short
      if (!cleanedTitle || cleanedTitle.length < 3) {
        return "New Conversation";
      }

      return cleanedTitle;
    } catch (error) {
      console.error("Failed to generate chat title:", error);
      return "New Conversation";
    }
  }

  /**
   * Delete embeddings
   * used when another process in a transaction fails,
   * or when the note itself is finally deleted
   * @param versionId
   * @param prismaTransaction
   */
  public async deleteEmbeddingsForVersion(
    versionId: string,
    prismaTransaction?: PrismaTransaction
  ) {
    try {
      const prismaObj = prismaTransaction || prisma;

      const result = await prismaObj.$executeRaw`
        DELETE FROM note_chunk 
        WHERE note_version_id = ${versionId}::uuid
      `;

      return {
        success: true,
        deletedCount: result,
      };
    } catch (error) {
      console.error(`Error deleting embeddings: ${error}`);
      throw new Error(
        `Failed to delete embeddings for version ${versionId}: ${error}`
      );
    }
  }

  /**
   * Create embedded chunks
   * used when publishing a note version
   * @param versionId
   * @param plainTextContent
   * @param prismaTransaction
   */
  public async createEmbeddedChunksForVersion(
    versionId: string,
    plainTextContent: string,
    prismaTransaction?: PrismaTransaction
  ): Promise<EmbeddedChunks> {
    try {
      // for shorter notes, just embed as single chunk
      if (plainTextContent.length <= AiService.SINGLE_CHUNK_THRESHOLD) {
        return await this.createSingleChunk(
          versionId,
          plainTextContent,
          prismaTransaction
        );
      }
      // for longer notes, chunk & embed
      return await this.createSentenceBasedChunks(
        versionId,
        plainTextContent,
        prismaTransaction
      );
    } catch (error) {
      console.error(`Error creating embeddings: ${error}`);

      // Check for OpenAI API quota errors (429)
      const errorStr = String(error);
      if (
        errorStr.includes("429") ||
        errorStr.toLowerCase().includes("quota exceeded")
      ) {
        throw new RateLimitError(
          "OpenAI API quota exceeded. Please check your plan and billing details."
        );
      }

      throw new Error(
        `Failed to create embeddings for version ${versionId}: ${error}`
      );
    }
  }

  /**
   * Create a single chunk - when note content is very short
   * @param versionId
   * @param plainTextContent
   * @param prismaTransaction
   */
  private async createSingleChunk(
    versionId: string,
    plainTextContent: string,
    prismaTransaction?: PrismaTransaction
  ): Promise<EmbeddedChunks> {
    // figure out which client instance we will use - prismaTransaction but fall back to regular prisma instance otherwise
    const prismaObj = prismaTransaction || prisma;

    // Calculate token count for tracking
    const tokenCount =
      tokenTrackingService.estimateTokensFromText(plainTextContent);

    // create the embedding
    const embedding =
      await Settings.embedModel.getTextEmbedding(plainTextContent);

    // Record token usage for this embedding operation
    try {
      await tokenTrackingService.recordTokenUsage({
        userId: this.userId,
        modelName: "text-embedding-3-small",
        operationType: "EMBEDDING",
        promptTokens: tokenCount,
        completionTokens: 0, // embeddings only have input tokens
        totalTokens: tokenCount,
        noteVersionId: versionId,
      });
    } catch (error) {
      console.error("Failed to record embedding token usage:", error);
    }

    const savedChunk = await prismaObj.$executeRaw`
      INSERT INTO note_chunk (id, note_version_id, chunk_index, chunk_text, embedding)
      VALUES (gen_random_uuid(), ${versionId}::uuid, 0, ${plainTextContent}, ${embedding}::vector(1536))
      RETURNING *
    `;

    return {
      success: true,
      chunksCreated: 1,
      chunks: [savedChunk],
    };
  }

  /**
   * Create multiple chunks, using sentence splitter
   * @param versionId
   * @param plainTextContent
   * @param prismaTransaction
   */
  private async createSentenceBasedChunks(
    versionId: string,
    plainTextContent: string,
    prismaTransaction?: PrismaTransaction
  ): Promise<EmbeddedChunks> {
    // figure out which client instance we will use - prismaTransaction but fall back to regular prisma instance otherwise
    const prismaObj = prismaTransaction || prisma;

    // split the text into sentence-coherent chunks
    const sentenceSplitter = new SentenceSplitter({
      chunkSize: 500, // Reasonable chunk size for notes
      chunkOverlap: 50, // Some overlap for context
      paragraphSeparator: "\n\n",
    });

    const chunks = sentenceSplitter.splitText(plainTextContent);

    // Calculate total token count for all chunks
    const totalTokens = chunks.reduce(
      (total, chunk) =>
        total + tokenTrackingService.estimateTokensFromText(chunk),
      0
    );

    const embeddings = await Settings.embedModel.getTextEmbeddings(chunks);

    // Record token usage for this embedding operation
    try {
      await tokenTrackingService.recordTokenUsage({
        userId: this.userId,
        modelName: "text-embedding-3-small",
        operationType: "EMBEDDING",
        promptTokens: totalTokens,
        completionTokens: 0, // embeddings only have input tokens
        totalTokens: totalTokens,
        noteVersionId: versionId,
      });
    } catch (error) {
      console.error("Failed to record embedding token usage:", error);
    }

    // Save chunks to database using raw SQL
    const savedChunks = [];
    for (let i = 0; i < chunks.length; i++) {
      const savedChunk = await prismaObj.$executeRaw`
        INSERT INTO note_chunk (id, note_version_id, chunk_index, chunk_text, embedding)
        VALUES (gen_random_uuid(), ${versionId}::uuid, ${i}, ${chunks[i]}, ${embeddings[i]}::vector(1536))
        RETURNING *
      `;
      savedChunks.push(savedChunk);
    }

    return {
      success: true,
      chunksCreated: savedChunks.length,
      chunks: savedChunks,
    };
  }

  public async createAgentFromScope(
    userId: string,
    chatScope: ChatScopeObject,
    messageHistory?: ChatMessage[]
  ): Promise<AgentWorkflow | undefined> {
    switch (chatScope.scope) {
      case "note":
        const agent = await createNoteChatAgent(
          userId,
          chatScope,
          messageHistory
        );
        return agent;
      // TO DO
      case "folder":
        // create the note chat agent
        break;
      // TO DO
      case "global":
        // create the note chat agent
        break;
      default:
        throw new Error(`Unknown agent scope: ${chatScope.scope}`);
    }
  }
}

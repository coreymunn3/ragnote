import { Document, Settings, SentenceSplitter, tool } from "llamaindex";
import { OpenAIEmbedding, openai } from "@llamaindex/openai";
import { prisma } from "@/lib/prisma";
import { PrismaTransaction } from "@/lib/types/sharedTypes";
import { RateLimitError } from "@/lib/errors/apiErrors";
import { ChatScopeObject, ChatMessage } from "@/lib/types/chatTypes";
import { createNoteChatAgent } from "./agents/noteChatAgent";
import { AgentWorkflow } from "@llamaindex/workflow";
import { EmbeddedChunks } from "./aiTypes";

export class AiService {
  private static readonly SINGLE_CHUNK_THRESHOLD = 500;

  constructor() {
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

    // create the embedding
    const embedding =
      await Settings.embedModel.getTextEmbedding(plainTextContent);

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
    const embeddings = await Settings.embedModel.getTextEmbeddings(chunks);

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

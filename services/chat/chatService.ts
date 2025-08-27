import { withErrorHandling } from "@/lib/errors/errorHandlers";
import { prisma } from "@/lib/prisma";
import {
  ChatScope,
  ChatScopeObject,
  PrismaChatMessage,
  PrismaChatSession,
  ChatMessage,
  ChatSession,
  SendChatResponse,
  LlmSource,
} from "@/lib/types/chatTypes";
import {
  createChatScopeSchema,
  getChatSessionSchema,
  getChatMessagesForSessionSchema,
  createChatMessageSchema,
  sendChatSchema,
  getChatSessionsForNoteSchema,
} from "./chatValidators";
import {
  transformToChatMessage,
  transformToChatSession,
} from "./chatTransformers";
import { InternalServerError, NotFoundError } from "@/lib/errors/apiErrors";
import { AiService } from "../ai/aiService";
import { AgentResultData, WorkflowEventData } from "@llamaindex/workflow";
import { Session } from "inspector/promises";

const aiService = new AiService();

export class ChatService {
  /**
   * Create a new chat session
   */
  public createChatSession = withErrorHandling(
    async (params: {
      userId: string;
      chatScope: ChatScopeObject;
    }): Promise<ChatSession> => {
      // at this point, data has already been validated!
      const { userId, chatScope } = params;

      // Create the session
      const session = await prisma.chat_session.create({
        data: {
          user_id: userId,
          chat_scope: chatScope,
          note_id: chatScope.scope === "note" ? chatScope.scopeId : null,
          folder_id: chatScope.scope === "folder" ? chatScope.scopeId : null,
          title: "New Session", // Will be auto-generated later
        },
      });

      // Transform the raw session to our application type
      return await transformToChatSession(session);
    }
  );

  /**
   * Creates a chatScope from the API passthrough data
   * TO DO - add the user ID to the chat scope
   */
  public createChatScope = withErrorHandling(
    async (params: {
      userId: string;
      scope: ChatScope;
      noteId?: string;
      folderId?: string;
    }): Promise<ChatScopeObject> => {
      const validatedData = createChatScopeSchema.parse(params);
      // create an initial chatScope with an empty noteVersions array
      const chatScope: ChatScopeObject = {
        scope: validatedData.scope,
        scopeId: validatedData.noteId || validatedData.folderId || null,
        noteVersions: [],
      };
      /**
       * Now, lets fill in the noteVersions array to properly build a fully scoped chat
       */
      // 1 - scope is note
      if (chatScope.scope === "note" && chatScope.scopeId) {
        const note = await prisma.note.findFirst({
          where: {
            id: chatScope.scopeId,
            user_id: validatedData.userId,
            is_deleted: false,
          },
          // this includes the most recently published version
          include: {
            versions: {
              where: { is_published: true },
              orderBy: { published_at: "desc" },
              take: 1,
            },
          },
        });

        if (note && note.versions.length > 0) {
          chatScope.noteVersions.push({
            noteId: note.id,
            versionId: note.versions[0].id,
          });
        }
      }
      // 2 - scope is folder (TO DO)
      // 3 - scope is global (TO DO)
      return chatScope;
    }
  );

  /**
   * Get the full session with chat scope correctly typed given a session ID
   */
  public getChatSession = withErrorHandling(
    async (params: {
      userId: string;
      sessionId: string;
    }): Promise<ChatSession> => {
      const { userId: validatedUserId, sessionId: validatedSessionId } =
        getChatSessionSchema.parse(params);
      // get the session for this user that isn't deleted (no messages)
      const session = await prisma.chat_session.findFirst({
        where: {
          id: validatedSessionId,
          user_id: validatedUserId,
          is_deleted: false,
        },
      });
      if (!session) {
        throw new NotFoundError("Chat session not found or access denied");
      }

      // Transform the session to our application type
      return await transformToChatSession(session);
    }
  );

  /**
   * Get messages for a chat session
   */
  public getChatMessagesForSession = withErrorHandling(
    async (params: {
      sessionId: string;
      userId: string;
      limit?: number;
      offset?: number;
    }): Promise<ChatMessage[]> => {
      const validatedData = getChatMessagesForSessionSchema.parse(params);
      // Get the chat session - ensure it belongs to this user and isn't deleted
      const validatedChatSession = await this.getChatSession({
        userId: validatedData.userId,
        sessionId: validatedData.sessionId,
      });
      // Get messages for the session
      const messages = await prisma.chat_message.findMany({
        where: {
          chat_session_id: validatedChatSession.id,
        },
        orderBy: { created_at: "asc" },
        take: validatedData.limit,
        skip: validatedData.offset,
      });

      // Transform each message to the application type
      return messages.map(transformToChatMessage);
    }
  );

  /**
   * Adds a new chat message given the session ID
   */
  private createChatMessage = withErrorHandling(
    async (params: {
      sessionId: string;
      sender: "USER" | "AI";
      message: string;
      llmResponse?: any;
      llmSources?: LlmSource[];
    }): Promise<ChatMessage> => {
      // validate - this private method is downstream of the session ID
      // so at this point we know the session ID is valid and exists and belongs to the user
      const validatedData = createChatMessageSchema.parse(params);
      // create the message
      const message = await prisma.chat_message.create({
        data: {
          chat_session_id: validatedData.sessionId,
          sender_type: validatedData.sender,
          content: validatedData.message,
          llm_response: validatedData.llmResponse,
          llm_sources: validatedData.llmSources,
        },
      });
      // update the sessions updated_at ts
      await prisma.chat_session.update({
        where: {
          id: validatedData.sessionId,
        },
        data: {
          updated_at: new Date(),
        },
      });

      // Transform to application type
      return transformToChatMessage(message);
    }
  );

  /**
   * Entry point for sending a chat
   * This method will orchestrate the entire pipeline of recieving the message from the API
   * and subsequently deciding what to do with it
   */
  public sendChat = withErrorHandling(
    async (params: {
      userId: string;
      message: string;
      scope: ChatScope;
      noteId?: string;
      folderId?: string;
      sessionId?: string;
    }): Promise<SendChatResponse> => {
      const {
        userId: validatedUserId,
        message: validatedMessage,
        scope: validatedScope,
        noteId: validatedNoteId,
        folderId: validatedFolderId,
        sessionId: validatedSessionId,
      } = sendChatSchema.parse(params);

      /**
       * Create the chat scope from the args
       */
      const currentChatScope = await this.createChatScope({
        userId: validatedUserId,
        scope: validatedScope,
        noteId: validatedNoteId,
        folderId: validatedFolderId,
      });

      /**
       * Get or create the chat session to use
       */
      let currentSession: ChatSession;

      if (validatedSessionId) {
        // Use existing session
        currentSession = await this.getChatSession({
          userId: validatedUserId,
          sessionId: validatedSessionId,
        });
      } else {
        // create the new session
        currentSession = await this.createChatSession({
          userId: validatedUserId,
          chatScope: currentChatScope,
        });
      }
      /**
       * Get message history for context (excluding the current message)
       */
      const messageHistory = await this.getChatMessagesForSession({
        sessionId: currentSession.id,
        userId: validatedUserId,
        limit: 50, // Last 50 messages for context
      });

      /**
       * Create the user's chat message
       */
      const userMessage = await this.createChatMessage({
        sessionId: currentSession.id,
        sender: "USER",
        message: validatedMessage,
      });

      /**
       * Create the agent with conversation context
       */
      const agent = await aiService.createAgentFromScope(
        validatedUserId,
        currentChatScope,
        messageHistory
      );
      if (!agent) {
        throw new InternalServerError(
          `Unable to create/init chat agent with scope: ${JSON.stringify(currentChatScope)}`
        );
      }

      // call the agent - TO DO eventually setup streaming (agent.runStream)
      const aiResponse = await agent.run(validatedMessage);

      /**
       * Create the ai chat response
       */
      const aiMessage = await this.createChatMessage({
        sessionId: currentSession.id,
        sender: "AI",
        message: aiResponse.data.message.content.toString(),
        llmResponse: JSON.parse(JSON.stringify(aiResponse.data)),
        // llmSources TO DO later - eventually we want to try to use the retrieved sources.
      });

      // return
      return {
        session: currentSession,
        userMessage,
        aiMessage,
      };
    }
  );

  /**
   * Gets all chat sessions for the note and user
   */
  public getChatSessionsForNote = withErrorHandling(
    async (params: {
      userId: string;
      noteId?: string;
    }): Promise<ChatSession[]> => {
      // validate the args
      const { userId: validatedUserId, noteId: validatedNoteId } =
        getChatSessionsForNoteSchema.parse(params);
      // get all chat sessions for the note and user
      const sessions = await prisma.chat_session.findMany({
        where: {
          user_id: validatedUserId,
          note_id: validatedNoteId,
          is_deleted: false,
        },
        orderBy: {
          updated_at: "desc",
        },
      });

      // Transform all sessions to application types
      const transformedSessions = await Promise.all(
        sessions.map((s) => transformToChatSession(s))
      );

      return transformedSessions;
    }
  );
}

import { withErrorHandling } from "@/lib/errors/errorHandlers";
import { prisma } from "@/lib/prisma";
import {
  ChatScope,
  ChatScopeObject,
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
  getChatSessionForUserSchema,
  updateChatSessionTitleSchema,
  softDeleteChatSessionSchema,
  recoverChatSessionSchema,
  getDeletedChatsSchema,
  getChatHistoryForScopeSchema,
} from "./chatValidators";
import {
  transformToChatMessage,
  transformToChatSession,
} from "./chatTransformers";
import {
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "@/lib/errors/apiErrors";
import { AiService } from "../ai/aiService";
import { tokenTrackingService } from "../tokenTracking/tokenTrackingService";
import { UserService } from "../user/userService";

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
    },
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
      // 1 - scope is note - get the current version (draft or published)
      if (chatScope.scope === "note" && chatScope.scopeId) {
        const note = await prisma.note.findFirst({
          where: {
            id: chatScope.scopeId,
            user_id: validatedData.userId,
            is_deleted: false,
          },
          select: {
            id: true,
            current_version_id: true,
          },
        });

        if (note && note.current_version_id) {
          chatScope.noteVersions.push({
            noteId: note.id,
            versionId: note.current_version_id,
          });
        }
      }
      // 2 - scope is folder - get the current version of each note in the folder
      if (chatScope.scope === "folder" && chatScope.scopeId) {
        // find all notes in the folder with their version data
        const notes = await prisma.note.findMany({
          where: {
            user_id: validatedData.userId,
            folder_id: chatScope.scopeId,
            is_deleted: false,
          },
          select: {
            id: true,
            current_version_id: true,
          },
        });
        // extract note id and last published version id for the scope
        notes.forEach((note) => {
          if (note.current_version_id) {
            chatScope.noteVersions.push({
              noteId: note.id,
              versionId: note.current_version_id,
            });
          }
        });
      }
      // 3 - scope is global - current version of each note
      if (chatScope.scope === "global" && !chatScope.scopeId) {
        // find all notes in the folder with their version data
        const notes = await prisma.note.findMany({
          where: {
            user_id: validatedData.userId,
            is_deleted: false,
          },
          select: {
            id: true,
            current_version_id: true,
          },
        });
        // extract note id and last published version id for the scope
        notes.forEach((note) => {
          if (note.current_version_id) {
            chatScope.noteVersions.push({
              noteId: note.id,
              versionId: note.current_version_id,
            });
          }
        });
      }
      return chatScope;
    },
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
    },
  );

  /**
   * Get all chat sessions for the user
   */
  public getChatSessionsForUser = withErrorHandling(
    async (params: { userId: string }): Promise<ChatSession[]> => {
      const { userId: validatedUserId } =
        getChatSessionForUserSchema.parse(params);
      // get all chat sessions for this user
      const sessions = await prisma.chat_session.findMany({
        where: {
          user_id: validatedUserId,
          is_deleted: false,
        },
      });
      // Transform all sessions to application types
      const transformedSessions = await Promise.all(
        sessions.map((s) => transformToChatSession(s)),
      );
      return transformedSessions;
    },
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
    },
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
    },
  );

  public ensureScopeIsFresh = withErrorHandling(
    async (params: {
      userId: string;
      chatScope: ChatScopeObject;
    }): Promise<void> => {
      const { userId, chatScope } = params;
      if (chatScope.noteVersions.length === 0) return;

      const versionIds = chatScope.noteVersions.map((v) => v.versionId);
      // find versions that need to be re-embedded (stale content)
      const staleVersions = await prisma.note_version.findMany({
        where: {
          id: { in: versionIds }, // versions in this scope
          OR: [
            // that have never been indexed OR whose updated_at is more recent than last indexed at
            { last_indexed_at: null },
            {
              updated_at: {
                gt: prisma.note_version.fields.last_indexed_at,
              },
            },
          ],
        },
        include: {
          note: {
            select: {
              title: true,
            },
          },
        },
      });
      // logging
      console.log(`${staleVersions.length} version need to be re-embedded`);
      // nothing stale, return
      if (staleVersions.length === 0) return;
      // if there are many stale versions, log it
      if (staleVersions.length >= 20) {
        console.log(
          `[ensureScopeIsFresh] Syncing ${staleVersions.length} stale versions.`,
        );
      }
      // re-embed stale versions
      console.log("re-embedding stale versions now...");
      console.time("reembedding-timer");
      const aiService = new AiService(userId);
      await Promise.all(
        staleVersions.map(async (version) => {
          try {
            await prisma.$transaction(async (tx) => {
              // delete old embeddings
              await aiService.deleteEmbeddingsForVersion(version.id, tx);
              // crete new embeddings
              await aiService.createEmbeddedChunksForVersion(
                version.id,
                version.note.title,
                version.plain_text_content,
                tx,
              );
              // update tracking fields
              await tx.note_version.update({
                where: {
                  id: version.id,
                },
                data: {
                  last_indexed_at: new Date(),
                  last_indexed_char_count: version.plain_text_content.length,
                },
              });
            });
          } catch (error) {
            // log error but don't fail the op
            console.error(
              `[ensureScopeIsFresh] Failed to sync version ${version.id}:`,
              error,
            );
            // re-throw to let promise.all catch
            throw error;
          }
        }),
      );
      // log the time spend re-embedding
      console.timeEnd("reembedding-timer");
    },
  );

  /**
   * Entry point for sending a chat message. This method orchestrates the entire
   * pipeline, from receiving the user's message to returning the AI's response.
   *
   * Workflow:
   * 1. Validates the incoming request parameters.
   * 2. Creates a `ChatScopeObject` to define the context for the conversation (e.g., specific note, folder).
   * 3. Initializes a user-scoped `AiService` for handling LLM interactions and token tracking.
   * 4. Retrieves an existing `ChatSession` or creates a new one if it's the start of a conversation.
   * 5. Fetches the recent message history to provide context for the LLM.
   * 6. Creates and persists the user's incoming message in the database.
   * 7. Constructs the appropriate AI agent based on the chat scope and injects the conversation history.
   * 8. Executes the agent with the user's message to get the AI response.
   * 9. Creates and persists the AI's response message in the database.
   * 10. Finalizes the token tracking record, linking it to the session and message IDs.
   * 11. **Asynchronously (non-blocking)**, if it's a new session, generates a descriptive title for the chat based on the user's first message.
   * 12. Returns the session, user message, and AI message to the client.
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
       * Guard: Check Pro access for chat features
       */
      const userService = new UserService();
      const hasProAccess = await userService.hasProAccess({
        userId: validatedUserId,
      });

      if (!hasProAccess) {
        throw new UnauthorizedError(
          "Chat features require an active Pro subscription",
        );
      }

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
       * Just in time content embedding - ensure the versions in-scope are 'fresh'
       */
      await this.ensureScopeIsFresh({
        userId: validatedUserId,
        chatScope: currentChatScope,
      });

      /**
       * Create user-scoped AI service for token tracking
       */
      const aiService = new AiService(validatedUserId);

      // Set note version context for token tracking
      // only set for the note scope - folder/global tracking at session level
      if (
        currentChatScope.scope === "note" &&
        currentChatScope.noteVersions[0]
      ) {
        aiService.setNoteVersionId(currentChatScope.noteVersions[0].versionId);
      }

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
        messageHistory,
      );
      if (!agent) {
        throw new InternalServerError(
          `Unable to create/init chat agent with scope: ${JSON.stringify(currentChatScope)}`,
        );
      }

      // call the agent - TO DO eventually setup streaming (agent.runStream)
      const aiResponse = await agent.run(validatedMessage);
      console.log("=== FULL AGENT RESPONSE ===");
      console.log(JSON.stringify(aiResponse, null, 2));
      console.log("=== END FULL AGENT RESPONSE ===");

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

      /**
       * Token Tracking: Update token record with chatMessageId and sessionId
       * Token Tracking is a 2 part process here.
       * Part 1 is when the initial token tracking record is created, which happens in the callback manager automatically
       * upon completion of the agent's workflow. At that stage we have the basic tracking info but are missing key data linkages
       * Here in part 2, we add those data linkages
       */
      const pendingRecordId = aiService.getPendingTokenRecordId();
      if (pendingRecordId) {
        try {
          await tokenTrackingService.updateTokenRecord({
            recordId: pendingRecordId,
            chatMessageId: aiMessage.id,
            chatSessionId: currentSession.id,
          });
          aiService.clearPendingTokenRecord();
          // debugging
          // console.log("📊 Updated token record (phase 2):", {
          //   recordId: pendingRecordId,
          //   chatMessageId: aiMessage.id,
          //   chatSessionId: currentSession.id,
          // });
        } catch (error) {
          console.error("Failed to update token record:", error);
        }
      }

      /**
       * Generate chat title for new sessions (non-blocking)
       * Only generate title if this is the first message in the session
       */
      if (messageHistory.length === 0) {
        console.log("generating title...");
        // Fire-and-forget title generation - don't await to avoid blocking response
        aiService
          .generateChatTitle(validatedMessage)
          .then((generatedTitle) => {
            return this.updateChatSessionTitle({
              sessionId: currentSession.id,
              title: generatedTitle,
              userId: validatedUserId,
            });
          })
          .then(() => {
            console.log(
              `Generated chat title for session ${currentSession.id}`,
            );
          })
          .catch((error) => {
            console.error(
              `Failed to generate/update chat title for session ${currentSession.id}:`,
              error,
            );
          });
      }

      // return
      return {
        session: currentSession,
        userMessage,
        aiMessage,
      };
    },
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
        sessions.map((s) => transformToChatSession(s)),
      );

      return transformedSessions;
    },
  );

  /**
   * Gets chat history for any scope (note, folder, or global)
   * Unified method to replace getChatSessionsForNote, getChatSessionsForFolder, etc.
   */
  public getChatHistoryForScope = withErrorHandling(
    async (params: {
      userId: string;
      scope: ChatScope;
      scopeId?: string;
    }): Promise<ChatSession[]> => {
      // Validate the args
      const validated = getChatHistoryForScopeSchema.parse(params);

      // Build the where clause based on scope
      const whereClause: any = {
        user_id: validated.userId,
        is_deleted: false,
      };

      // Add scope-specific filters
      if (validated.scope === "note") {
        whereClause.note_id = validated.scopeId;
      } else if (validated.scope === "folder") {
        whereClause.folder_id = validated.scopeId;
      } else if (validated.scope === "global") {
        // Global = no note_id or folder_id (user's general chats)
        whereClause.note_id = null;
        whereClause.folder_id = null;
      }

      // Get all chat sessions matching the scope
      const sessions = await prisma.chat_session.findMany({
        where: whereClause,
        orderBy: {
          updated_at: "desc",
        },
      });

      // Transform all sessions to application types
      const transformedSessions = await Promise.all(
        sessions.map((s) => transformToChatSession(s)),
      );

      return transformedSessions;
    },
  );

  /**
   * Update the title of a chat session
   */
  public updateChatSessionTitle = withErrorHandling(
    async (params: {
      sessionId: string;
      title: string;
      userId: string;
    }): Promise<ChatSession> => {
      const {
        // validate args
        sessionId: validatedSessionId,
        title: validatedTitle,
        userId: validatedUserId,
      } = updateChatSessionTitleSchema.parse(params);

      // verify the chat session exists and belongs to the user and not deleted
      const chatSession = await prisma.chat_session.findFirst({
        where: {
          id: validatedSessionId,
          user_id: validatedUserId,
          is_deleted: false,
        },
      });
      if (!chatSession) {
        throw new NotFoundError("Chat session not found or access denied");
      }
      // update the session title
      const updatedChat = await prisma.chat_session.update({
        where: {
          id: validatedSessionId,
          user_id: validatedUserId,
        },
        data: {
          title: validatedTitle,
        },
      });
      // transform and return
      const transformedSession = await transformToChatSession(updatedChat);
      return transformedSession;
    },
  );

  /**
   * Soft delete a chat session
   */
  public softDeleteChatSession = withErrorHandling(
    async (params: { sessionId: string; userId: string }): Promise<void> => {
      // validate args
      const { sessionId: validatedSessionId, userId: validatedUserId } =
        softDeleteChatSessionSchema.parse(params);
      // verfiy the chat session exists and belongs to the user
      const chatSession = await prisma.chat_session.findFirst({
        where: {
          id: validatedSessionId,
          user_id: validatedUserId,
          is_deleted: false,
        },
      });
      if (!chatSession) {
        throw new NotFoundError("Chat session not found or access denied");
      }
      // soft delete
      await prisma.chat_session.update({
        where: {
          id: validatedSessionId,
          user_id: validatedUserId,
        },
        data: {
          is_deleted: true,
        },
      });
    },
  );

  /**
   * Recover a soft deleted chat session
   */
  public recoverChatSession = withErrorHandling(
    async (params: { sessionId: string; userId: string }): Promise<void> => {
      // validate args
      const { sessionId: validatedSessionId, userId: validatedUserId } =
        recoverChatSessionSchema.parse(params);

      // verify the chat session exists and belongs to the user and is deleted
      const chatSession = await prisma.chat_session.findFirst({
        where: {
          id: validatedSessionId,
          user_id: validatedUserId,
          is_deleted: true,
        },
      });
      if (!chatSession) {
        throw new NotFoundError("Chat session not found or not yet deleted");
      }

      // recover the chat session
      await prisma.chat_session.update({
        where: {
          id: validatedSessionId,
          user_id: validatedUserId,
        },
        data: {
          is_deleted: false,
        },
      });
    },
  );

  /**
   * Get all deleted chat sessions for a user
   */
  public getDeletedChats = withErrorHandling(
    async (userId: string): Promise<ChatSession[]> => {
      const { userId: validatedUserId } = getDeletedChatsSchema.parse({
        userId,
      });

      const sessions = await prisma.chat_session.findMany({
        where: {
          user_id: validatedUserId,
          is_deleted: true,
        },
        orderBy: {
          updated_at: "desc",
        },
      });

      // Transform all sessions to application types
      const transformedSessions = await Promise.all(
        sessions.map((s) => transformToChatSession(s)),
      );

      return transformedSessions;
    },
  );
}

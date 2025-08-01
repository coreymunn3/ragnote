import { withErrorHandling } from "@/lib/errors/errorHandlers";
import { prisma } from "@/lib/prisma";
import {
  ChatScope,
  ChatScopeObject,
  PrismaChatMessage,
  PrismaChatSession,
} from "@/lib/types/chatTypes";
import {
  createChatScopeSchema,
  getChatSessionSchema,
  getChatMessagesSchema,
  createChatMessageSchema,
  sendChatSchema,
} from "./chatValidators";
import { NotFoundError } from "@/lib/errors/apiErrors";

export class ChatService {
  /**
   * Create a new chat session
   */
  public createChatSession = withErrorHandling(
    async (params: {
      userId: string;
      chatScope: ChatScopeObject;
    }): Promise<PrismaChatSession> => {
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

      // Cast the session to our expected type
      return {
        ...session,
        chat_scope: session.chat_scope as ChatScopeObject,
      };
    }
  );

  /**
   * Creates a chatScope from the API passthrough data
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

  public getChatSession = withErrorHandling(
    async (params: {
      userId: string;
      sessionId: string;
    }): Promise<PrismaChatSession> => {
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

      // Cast the session to our expected type
      return {
        ...session,
        chat_scope: session.chat_scope as ChatScopeObject,
      };
    }
  );

  /**
   * Get messages for a chat session
   */
  public getChatMessages = withErrorHandling(
    async (params: {
      sessionId: string;
      userId: string;
      limit?: number;
      offset?: number;
    }): Promise<PrismaChatMessage[]> => {
      const validatedData = getChatMessagesSchema.parse(params);

      // Get messages for the session
      const messages = await prisma.chat_message.findMany({
        where: {
          chat_session_id: validatedData.sessionId,
        },
        orderBy: { created_at: "asc" },
        take: validatedData.limit,
        skip: validatedData.offset,
      });

      return messages;
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
      referencedNoteChunkIds?: string[];
      referencedFileChunkIds?: string[];
    }): Promise<PrismaChatMessage> => {
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
          referenced_note_chunk_ids: validatedData.referencedNoteChunkIds,
          referenced_file_chunk_ids: validatedData.referencedFileChunkIds,
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

      return message;
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
    }) => {
      const {
        userId: validatedUserId,
        message: validatedMessage,
        scope: validatedScope,
        noteId: validatedNoteId,
        folderId: validatedFolderId,
        sessionId: validatedSessionId,
      } = sendChatSchema.parse(params);

      /**
       * Get or create the chat session to use
       */
      let currentSession: PrismaChatSession;

      if (validatedSessionId) {
        // Use existing session
        currentSession = await this.getChatSession({
          userId: validatedUserId,
          sessionId: validatedSessionId,
        });
      } else {
        // Create new session - first create the chat scope
        const currentChatScope = await this.createChatScope({
          userId: validatedUserId,
          scope: validatedScope,
          noteId: validatedNoteId,
          folderId: validatedFolderId,
        });

        currentSession = await this.createChatSession({
          userId: validatedUserId,
          chatScope: currentChatScope,
        });
      }

      /**
       * Create the user's chat message
       */
      const userMessage = await this.createChatMessage({
        sessionId: currentSession.id,
        sender: "USER",
        message: validatedMessage,
      });

      /**
       * Generate the AI Response
       * for now...a dummy response
       */
      const dummyResponse =
        "Hi, Im your AI Assistant, but I havent been implemented yet! Hope you are having a great day.";
      // save the AI response
      const aiMessage = await this.createChatMessage({
        sessionId: currentSession.id,
        sender: "AI",
        message: dummyResponse,
      });
      // return
      return {
        session: currentSession,
        userMessage,
        aiMessage,
      };
    }
  );
}

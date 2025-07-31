import { withErrorHandling } from "@/lib/errors/errorHandlers";
import { prisma } from "@/lib/prisma";
import { ChatScope, ChatScopeObject } from "@/lib/types/chatTypes";
import { createChatScopeSchema } from "./chatValidators";

export class ChatService {
  /**
   * Create a new chat session
   */
  public createChatSession = withErrorHandling(
    async (params: { userId: string; chatScope: ChatScopeObject }) => {
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

      return session;
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
    }) => {
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

  public createChatMessage = withErrorHandling(async (params) => {
    // TO DO - create a chat message given a session
  });
}

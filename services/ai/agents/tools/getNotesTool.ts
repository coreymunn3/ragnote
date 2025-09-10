import { prisma } from "@/lib/prisma";
import { ChatScopeObject } from "@/lib/types/chatTypes";
import { PrismaNote, PrismaNoteVersion } from "@/lib/types/noteTypes";
import { tool } from "llamaindex";
import z from "zod";

export const createGetNotesTool = async (
  userId: string,
  chatScope: ChatScopeObject
) => {
  return tool({
    name: "get_notes_content",
    description:
      "retrieves notes given a chat scope that the user would like you to analyze or summarize",
    parameters: z.object({}),
    execute: async () => {
      const versionContent = await getNoteVersionsForScope(userId, chatScope);
      return {
        notes: versionContent.map((noteVersion) => ({
          title: noteVersion.note.title,
          content: noteVersion.plain_text_content,
          lastUpdated: noteVersion.updated_at.toISOString(),
        })),
        totalNotes: versionContent.length,
      };
    },
  });
};

const getNoteVersionsForScope = async (
  userId: string,
  chatScope: ChatScopeObject
): Promise<(PrismaNoteVersion & { note: PrismaNote })[]> => {
  // this handles all 3 chat scope instances - note, folder, and global
  const versionIds = chatScope.noteVersions.map((version) => version.versionId);
  const noteContent = await prisma.note_version.findMany({
    where: {
      id: {
        in: versionIds,
      },
      note: {
        user_id: userId,
        is_deleted: false,
      },
      is_published: true,
    },
    include: {
      note: true,
    },
  });
  return noteContent;
};

import { prisma } from "@/lib/prisma";
import {
  createNoteSchema,
  getNotesInFolderSchema,
  userIdSchema,
  moveNoteSchema,
  togglePinNoteSchema,
  softDeleteNoteSchema,
  updateNoteVersionContentSchema,
  getNoteContentSchema,
  getNoteSchema,
  getNoteVersionsSchema,
  getNoteVersionSchema,
  publishNoteVersionSchema,
  getRecoverNoteSchema,
} from "./noteValidators";
import {
  Note,
  NoteContent,
  PrismaNote,
  PrismaNoteVersion,
  PublishNoteResponse,
  UpdateNoteVersionContentResponse,
} from "@/lib/types/noteTypes";
import { NotFoundError, UnauthorizedError } from "@/lib/errors/apiErrors";
import { withErrorHandling } from "@/lib/errors/errorHandlers";
import { transformToNote } from "./noteTransformers";
import { AiService } from "../ai/aiService";
import { PrismaTransaction } from "@/lib/types/sharedTypes";
import { UserService } from "../user/userService";
import { RichTextExtractor } from "./richTextExtractor";

export class NoteService {
  /**
   * Private helper method to enrich notes with preview text
   */
  private async enrichNotesWithPreviews<
    T extends { current_version_id: string | null },
  >(notes: T[]): Promise<(T & { preview: string })[]> {
    return Promise.all(
      notes.map(async (note) => ({
        ...note,
        preview: await this.getNotePreview(note.current_version_id!),
      })),
    );
  }

  /**
   * Create a Note
   */
  public createNote = withErrorHandling(
    async (params: {
      userId: string;
      title: string;
      folderId?: string;
    }): Promise<PrismaNote> => {
      // Validate the request data
      const { userId, title, folderId } = createNoteSchema.parse(params);

      // Create the base note record and first version in a transaction
      const newNote = await prisma.$transaction(async (tx) => {
        // Validate folder ownership if folderId is provided
        if (folderId) {
          const folder = await tx.folder.findFirst({
            where: {
              id: folderId,
              user_id: userId,
              is_deleted: false,
            },
          });

          if (!folder) {
            throw new NotFoundError("Folder not found or access denied");
          }
        }

        // Create the note
        const note = await tx.note.create({
          data: {
            title: title,
            user_id: userId,
            folder_id: folderId,
            is_deleted: false,
            is_pinned: false,
          },
        });

        // Create the first version
        const version = await tx.note_version.create({
          data: {
            note_id: note.id,
            version_number: 1,
            rich_text_content: [{}],
            plain_text_content: "",
            is_published: false,
          },
        });

        // Update the note with current_version_id
        const updatedNote = await tx.note.update({
          where: { id: note.id },
          data: {
            current_version_id: version.id,
          },
        });

        return updatedNote;
      });

      return newNote;
    },
  );

  /**
   * Get all the notes for a user given user id
   */
  public getAllNotesForUser = withErrorHandling(
    async (userId: string): Promise<Note[]> => {
      const { userId: validatedUserId } = userIdSchema.parse({
        userId,
      });
      // get all notes for this user
      const notes = await prisma.note.findMany({
        where: {
          user_id: validatedUserId,
          is_deleted: false,
        },
        include: {
          current_version: true,
          _count: {
            select: {
              permissions: true,
            },
          },
        },
      });
      // enrich with previews
      const notesWithPreviews = await this.enrichNotesWithPreviews(notes);

      // transform the notes into the correct type and structure
      const transformedNotes = notesWithPreviews.map((note) =>
        transformToNote(note),
      );
      return transformedNotes;
    },
  );

  /**
   * Get all the notes in a folder
   */
  public getAllNotesInFolder = withErrorHandling(
    async (folderId: string, userId: string): Promise<Note[]> => {
      // validate request data
      const validatedData = getNotesInFolderSchema.parse({ folderId, userId });

      // otherwise, its a regular folder so we get all notes in this folder
      const notes = await prisma.note.findMany({
        where: {
          folder_id: validatedData.folderId,
          user_id: validatedData.userId,
          is_deleted: false,
        },
        include: {
          current_version: true,
          _count: {
            select: {
              permissions: true,
            },
          },
        },
      });

      const notesWithPreviews = await this.enrichNotesWithPreviews(notes);

      // transform the notes into the correct type and structure
      const transformedNotes = notesWithPreviews.map((note) =>
        transformToNote(note),
      );
      return transformedNotes;
    },
  );

  /**
   * Get the preview of a note given the version ID
   */
  public getNotePreview = withErrorHandling(
    async (versionId: string): Promise<string> => {
      // Get the plain text content from the version ID
      const versionContent = await prisma.note_version.findUnique({
        where: {
          id: versionId,
        },
        select: {
          plain_text_content: true,
        },
      });

      if (!versionContent) {
        throw new NotFoundError("Note version not found");
      }

      const plainText = versionContent.plain_text_content;

      if (!plainText || plainText.trim().length === 0) {
        return "No content available";
      }

      // Trim to approximately 100 characters at word boundary
      if (plainText.length > 100) {
        const truncated = plainText.substring(0, 100);
        const lastSpaceIndex = truncated.lastIndexOf(" ");
        return lastSpaceIndex > 50
          ? truncated.substring(0, lastSpaceIndex) + "..."
          : truncated + "...";
      }

      return plainText;
    },
  );

  // Get all Shared Notes
  public getSharedNotes = withErrorHandling(
    async (userId: string): Promise<Note[]> => {
      const { userId: validatedUserId } = userIdSchema.parse({
        userId,
      });

      // Find all notes that have been shared with this user
      const sharedNotes = await prisma.note.findMany({
        where: {
          permissions: {
            some: {
              shared_with_user_id: validatedUserId,
              active: true,
            },
          },
          is_deleted: false,
        },
        include: {
          current_version: true,
          _count: {
            select: {
              permissions: true,
            },
          },
        },
      });

      const notesWithPreviews = await this.enrichNotesWithPreviews(sharedNotes);

      // Transform the notes into the correct type and structure
      const transformedSharedNotes = notesWithPreviews.map((note) =>
        transformToNote(note),
      );
      return transformedSharedNotes;
    },
  );

  // Get all Deleted Notes
  public getDeletedNotes = withErrorHandling(
    async (userId: string): Promise<Note[]> => {
      const { userId: validatedUserId } = userIdSchema.parse({
        userId,
      });

      // find all notes that have been soft deleted by this user
      const deletedNotes = await prisma.note.findMany({
        where: {
          is_deleted: true,
          user_id: validatedUserId,
        },
        include: {
          current_version: true,
          _count: {
            select: {
              permissions: true,
            },
          },
        },
      });

      const notesWithPreviews =
        await this.enrichNotesWithPreviews(deletedNotes);

      // transform response
      const transformedDeleted = notesWithPreviews.map((note) =>
        transformToNote(note),
      );
      return transformedDeleted;
    },
  );

  // toggle the note to pinned/unpinned
  public togglePinNote = withErrorHandling(
    async (params: { noteId: string; userId: string }): Promise<PrismaNote> => {
      const { noteId, userId } = togglePinNoteSchema.parse(params);

      // Verify the note exists and belongs to the user
      const note = await prisma.note.findFirst({
        where: {
          id: noteId,
          user_id: userId,
          is_deleted: false,
        },
      });

      if (!note) {
        throw new NotFoundError("Note not found or access denied");
      }

      // toggle the notes pinned field
      const updatedNote = await prisma.note.update({
        where: {
          id: noteId,
        },
        data: {
          is_pinned: !note.is_pinned,
        },
        include: {
          current_version: true,
          _count: {
            select: {
              permissions: true,
            },
          },
        },
      });
      return updatedNote;
    },
  );

  // move not to another folder
  public moveNote = withErrorHandling(
    async (params: {
      noteId: string;
      folderId: string;
      userId: string;
    }): Promise<PrismaNote> => {
      const { noteId, userId, folderId } = moveNoteSchema.parse(params);

      // Verify the note exists and belongs to the user
      const note = await prisma.note.findFirst({
        where: {
          id: noteId,
          user_id: userId,
          is_deleted: false,
        },
      });

      if (!note) {
        throw new NotFoundError("Note not found or access denied");
      }

      // Verify the target folder exists and belongs to the user (if not null)
      if (folderId) {
        const folder = await prisma.folder.findFirst({
          where: {
            id: folderId,
            user_id: userId,
            is_deleted: false,
          },
        });

        if (!folder) {
          throw new NotFoundError("Target folder not found or access denied");
        }
      }

      // move the note
      const updatedNote = await prisma.note.update({
        where: {
          id: noteId,
        },
        data: {
          folder_id: folderId,
        },
      });
      return updatedNote;
    },
  );

  // soft delete note
  public softDeleteNote = withErrorHandling(
    async (params: { noteId: string; userId: string }): Promise<void> => {
      const { noteId, userId } = softDeleteNoteSchema.parse(params);

      // Verify the note exists and belongs to the user
      const note = await prisma.note.findFirst({
        where: {
          id: noteId,
          user_id: userId,
          is_deleted: false, // can't delete already deleted notes
        },
      });

      if (!note) {
        throw new NotFoundError("Note not found or already deleted");
      }

      // Soft delete the note & set to unpinned
      await prisma.note.update({
        where: {
          id: noteId,
        },
        data: {
          is_deleted: true,
          is_pinned: false,
        },
      });
    },
  );

  // recover note soft deleted
  public recoverNote = withErrorHandling(
    async (params: { noteId: string; userId: string }): Promise<void> => {
      const { noteId, userId } = getRecoverNoteSchema.parse(params);
      // verify note exists and belongs to the user, and include folder info
      const note = await prisma.note.findFirst({
        where: {
          id: noteId,
          user_id: userId,
          is_deleted: true,
        },
        include: {
          folder: true, // Include folder to check if it's deleted
        },
      });
      if (!note) {
        throw new NotFoundError("Note not found or not yet deleted");
      }

      // If the parent folder exists and is deleted, recover it too to maintain folder structure
      if (note.folder_id && note.folder && note.folder.is_deleted) {
        await prisma.$transaction([
          // Recover the folder first
          prisma.folder.update({
            where: { id: note.folder_id },
            data: { is_deleted: false },
          }),
          // Then recover the note
          prisma.note.update({
            where: { id: noteId },
            data: { is_deleted: false },
          }),
        ]);
      } else {
        // Just recover the note if folder doesn't exist or is not deleted
        await prisma.note.update({
          where: {
            id: noteId,
            user_id: userId,
          },
          data: {
            is_deleted: false,
          },
        });
      }
    },
  );

  /**
   * Update note content with both rich text and plain text versions
   * Update the note title, using the first non-empty block from the rich text content
   * Used when saving note edits from the rich text editor
   *
   * PHASE 1: Fast save of content (no blocking on embeddings)
   * PHASE 2: Async embedding creation in background (if needed)
   */
  public updateNoteVersionContent = withErrorHandling(
    async (params: {
      versionId: string;
      richTextContent: any;
      userId: string;
    }): Promise<UpdateNoteVersionContentResponse> => {
      const validatedData = updateNoteVersionContentSchema.parse(params);
      const { versionId, richTextContent, userId } = validatedData;

      // Verify the note version exists and belongs to the user
      const noteVersion = await prisma.note_version.findFirst({
        where: {
          id: versionId,
          note: {
            user_id: userId,
            is_deleted: false, // Keep this filter to prevent editing deleted notes
          },
        },
      });

      if (!noteVersion) {
        throw new NotFoundError("Note version not found or access denied");
      }

      // Extract plain text and title from rich text content
      const plainTextContent =
        RichTextExtractor.extractPlainText(richTextContent);
      const extractedTitle = RichTextExtractor.extractTitle(richTextContent);

      /**
       * Automatic note version embedding
       *
       * Over time as the user edits the note, the note's embeddings will slowly become more and more stale
       * So, after a certain amount of editing or time has passed, we should automatically re-embed in the background
       * so that if the user suddenly decides to use AI features, the embedding will contain the note's data.
       * from here on out, 'index' refers to 'embedding'
       *
       * This has several steps:
       * - compute the time since the last indexing
       * - compute the difference in characters since the last indexing
       *
       */

      // Check if indexing is needed
      const INDEXING_COOLDOWN = 10 * 60 * 1000; // 10 minutes
      const SIGNIFICANT_CHANGE_THRESHOLD = 500; // characters

      // calculate the time since the note was last embedding
      const timeSinceLastIndex = noteVersion.last_indexed_at
        ? Date.now() - noteVersion.last_indexed_at.getTime()
        : Infinity;
      // calculate the difference in chars since the last embedding
      const lastIndexCharDetla = Math.abs(
        (noteVersion.last_indexed_char_count || 0) - plainTextContent.length,
      );
      // figure out if we should index based on these content differences
      const shouldIndex =
        !noteVersion.last_indexed_at ||
        timeSinceLastIndex > INDEXING_COOLDOWN ||
        lastIndexCharDetla > SIGNIFICANT_CHANGE_THRESHOLD;
      // logging
      console.log(
        `should index: ${shouldIndex}`,
        timeSinceLastIndex,
        lastIndexCharDetla,
      );

      /**
       * PHASE 1: Fast transaction -  update the note title and version content
       */
      const result = await prisma.$transaction(async (tx) => {
        // Update the note title
        const updatedNote = await tx.note.update({
          where: {
            id: noteVersion.note_id,
          },
          data: {
            title: extractedTitle,
          },
          select: {
            id: true,
            title: true,
            updated_at: true,
          },
        });

        // Save the version content
        const savedVersion = await tx.note_version.update({
          where: { id: versionId },
          data: {
            rich_text_content: richTextContent,
            plain_text_content: plainTextContent,
          },
        });

        return {
          version: savedVersion,
          note: updatedNote,
        };
      });

      /**
       * PHASE 2: Async embedding creation (truly non-blocking fire-and-forget)
       * The promise is intentionally NOT awaited so the response is returned immediately after Phase 1.
       * If this fails, the next save will retry based on the indexing logic.
       */
      if (shouldIndex) {
        prisma
          .$transaction(async (tx) => {
            console.log(
              `🔄 Starting async embedding creation for version ${versionId} of note ${extractedTitle}`,
            );
            // instance of ai service
            const aiService = new AiService(userId);
            // Delete old embeddings
            await aiService.deleteEmbeddingsForVersion(versionId, tx);

            // Create new embeddings
            await aiService.createEmbeddedChunksForVersion(
              versionId,
              extractedTitle,
              plainTextContent,
              tx,
            );

            // Update the indexed metadata
            await tx.note_version.update({
              where: { id: versionId },
              data: {
                last_indexed_at: new Date(),
                last_indexed_char_count: plainTextContent.length,
              },
            });

            console.log(
              `Embedding creation completed for version ${versionId} of note ${extractedTitle}`,
            );
          })
          .catch((error) => {
            console.error(
              `Failed to create embeddings asynchronously for version ${versionId} of note ${extractedTitle}:`,
              error,
            );
            // Don't throw - this is fire-and-forget
            // The next save will retry if needed based on the indexing logic
          });
      }

      return result;
    },
  );

  /**
   * Get rich text and plain text content
   * The response can be destructured to return only the content you need in the moment, so no need to make 2 functions
   */
  public getNoteContent = withErrorHandling(
    async (params: {
      versionId: string;
      userId: string;
    }): Promise<NoteContent> => {
      const { versionId, userId } = getNoteContentSchema.parse(params);
      const versionContent = await prisma.note_version.findFirst({
        where: {
          id: versionId,
          note: {
            user_id: userId,
          },
        },
        select: {
          plain_text_content: true,
          rich_text_content: true,
        },
      });

      if (!versionContent) {
        throw new NotFoundError(
          `Note version not found for version ${versionId} or access denied`,
        );
      }

      return {
        plainTextContent: versionContent.plain_text_content,
        richTextContent: versionContent.rich_text_content,
      };
    },
  );

  /**
   * Get the note data
   */
  public getNoteById = withErrorHandling(
    async (params: { noteId: string; userId: string }): Promise<Note> => {
      const { noteId, userId } = getNoteSchema.parse(params);

      // Find note that user either owns OR has been shared with them
      const note = await prisma.note.findFirst({
        where: {
          id: noteId,
          OR: [
            // User owns the note
            { user_id: userId },
            // Note has been shared with the user
            {
              permissions: {
                some: {
                  shared_with_user_id: userId,
                  active: true,
                },
              },
            },
          ],
        },
        include: {
          current_version: true,
          _count: {
            select: {
              permissions: true,
            },
          },
        },
      });

      if (!note) {
        throw new NotFoundError(
          `Note not found for note ${noteId} or access denied`,
        );
      }

      // Enrich with preview
      const noteWithPreview = await this.enrichNotesWithPreviews([note]);

      // Transform and return
      return transformToNote(noteWithPreview[0]);
    },
  );

  /**
   * Get list of versions for a note using its ID
   * FREE users: Returns only the current version
   * PRO users: Returns full version history
   */
  public getNoteVersions = withErrorHandling(
    async (params: {
      noteId: string;
      userId: string;
    }): Promise<PrismaNoteVersion[]> => {
      const { noteId, userId } = getNoteVersionsSchema.parse(params);

      // Check Pro access
      const userService = new UserService();
      const hasProAccess = await userService.hasProAccess({ userId });

      // Get the note to find current version
      const note = await prisma.note.findFirst({
        where: {
          id: noteId,
          user_id: userId,
          is_deleted: false,
        },
        select: {
          current_version_id: true,
        },
      });

      if (!note) {
        throw new NotFoundError(
          `Note not found for note ${noteId} or access denied`,
        );
      }

      // FREE users: Return only current version
      if (!hasProAccess && note.current_version_id) {
        const currentVersion = await prisma.note_version.findUnique({
          where: { id: note.current_version_id },
        });

        return currentVersion ? [currentVersion] : [];
      }

      // PRO users: Return full version history
      const noteVersions = await prisma.note_version.findMany({
        where: {
          note_id: noteId,
          note: {
            user_id: userId,
          },
        },
        orderBy: {
          version_number: "desc",
        },
      });

      if (!noteVersions) {
        throw new NotFoundError(
          `Note Versions not found for note ${noteId} or access denied`,
        );
      }

      return noteVersions;
    },
  );

  /**
   * Get the data for a specific note version
   */
  public getNoteVersion = withErrorHandling(
    async (params: { versionId: string; userId: string }) => {
      const { versionId, userId } = getNoteVersionSchema.parse(params);

      // Get the version with note info to check if it's the current version
      const noteVersionWithNote = await prisma.note_version.findFirst({
        where: {
          id: versionId,
          note: {
            user_id: userId,
          },
        },
        include: {
          note: {
            select: { current_version_id: true },
          },
        },
      });

      if (!noteVersionWithNote) {
        throw new NotFoundError(
          `Note Version not found for version ${versionId} or access denied`,
        );
      }

      // Conditional Guard: Only require Pro for NON-CURRENT versions (history)
      const isCurrentVersion =
        noteVersionWithNote.note.current_version_id === versionId;

      if (!isCurrentVersion) {
        const userService = new UserService();
        const hasProAccess = await userService.hasProAccess({ userId });

        if (!hasProAccess) {
          throw new UnauthorizedError(
            "Accessing version history requires an active Pro subscription",
          );
        }
      }

      // Return just the version without the note relation
      const { note, ...noteVersion } = noteVersionWithNote;
      return noteVersion;
    },
  );

  /**
   * Copies the current version, and incriments the version number
   */
  private incrimentNoteVersion = withErrorHandling(
    async (
      currentVersion: PrismaNoteVersion,
      prismaTransaction?: PrismaTransaction,
    ) => {
      // Determine which client to use - transaction or global prisma
      const prismaObj = prismaTransaction || prisma;

      // create a copy of the current version with:
      // - not published
      // - version number +1 higher
      const nextVersion = await prismaObj.note_version.create({
        data: {
          note_id: currentVersion.note_id,
          version_number: currentVersion.version_number + 1,
          rich_text_content: currentVersion.rich_text_content,
          plain_text_content: currentVersion.plain_text_content,
          is_published: false,
        },
      });
      return nextVersion;
    },
  );

  /**
   * Publish a note version and create a new draft version
   * Returns both the published version and the new draft version
   */
  public publishNoteVersion = withErrorHandling(
    async (params: {
      versionId: string;
      userId: string;
    }): Promise<PublishNoteResponse> => {
      // Validate input parameters
      const { versionId: validatedVersionId, userId: validatedUserId } =
        publishNoteVersionSchema.parse(params);

      // Guard: Check Pro access for publishing
      const userService = new UserService();
      const hasProAccess = await userService.hasProAccess({
        userId: validatedUserId,
      });

      if (!hasProAccess) {
        throw new UnauthorizedError(
          "Publishing notes requires an active Pro subscription",
        );
      }

      // create instance of AiService for embeddings, later
      const aiService = new AiService(validatedUserId);

      // ensure the user has permissions to access this version
      // (user checks occur within this method)
      const currentVersion = await this.getNoteVersion({
        versionId: validatedVersionId,
        userId: validatedUserId,
      });
      // get the note
      const note = await this.getNoteById({
        noteId: currentVersion.note_id,
        userId: validatedUserId,
      });

      // Check if the version is already published to prevent duplicate publishing
      if (currentVersion.is_published) {
        throw new Error("This version is already published");
      }

      // Get the plain text content for embedding
      const { plainTextContent } = await this.getNoteContent({
        versionId: validatedVersionId,
        userId: validatedUserId,
      });

      // Execute all operations in a transaction
      const result = await prisma.$transaction(async (tx) => {
        try {
          // Create embeddings using the RAG service with the transaction
          await aiService.createEmbeddedChunksForVersion(
            validatedVersionId,
            note.title,
            plainTextContent,
            tx,
          );

          // Update the version's published status
          const publishedVersion = await tx.note_version.update({
            where: {
              id: validatedVersionId,
            },
            data: {
              is_published: true,
              published_at: new Date(),
              last_indexed_at: new Date(),
              last_indexed_char_count: plainTextContent.length,
            },
          });

          // Create a new incremented version as the next draft
          const nextVersion = await this.incrimentNoteVersion(
            publishedVersion,
            tx,
          );

          // Update the note to point to the published version as current
          await tx.note.update({
            where: {
              id: publishedVersion.note_id,
            },
            data: {
              current_version_id: nextVersion.id,
            },
          });

          return {
            publishedVersion,
            nextVersion,
          };
        } catch (error) {
          // If any error occurs, the transaction will automatically roll back
          // All database operations including embedding inserts will be rolled back

          // Log the error for debugging
          console.error("Error in publishNote transaction:", error);

          // Re-throw the error to be handled by withErrorHandling
          throw error;
        }
      });

      return result;
    },
  );
}

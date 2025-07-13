import { prisma } from "@/lib/prisma";
import {
  createNoteSchema,
  getNotesInFolderSchema,
  getSystemNotesSchema,
  moveNoteSchema,
  togglePinNoteSchema,
  deleteNoteSchema,
  updateNoteVersionContentSchema,
  getNoteContentSchema,
  getNoteSchema,
  updateNoteTitleSchema,
  getNoteVersionsSchema,
} from "./noteValidators";
import {
  Note,
  NoteContent,
  PrismaNote,
  PrismaNoteVersion,
} from "@/lib/types/noteTypes";
import { NotFoundError } from "@/lib/errors/apiErrors";
import { withErrorHandling } from "@/lib/errors/errorHandlers";
import { transformToNote } from "./noteTransformers";
import { SYSTEM_FOLDERS } from "@/lib/types/folderTypes";
import { isSystemFolder } from "@/lib/utils/folderUtils";
import { NoteTextExtractor } from "./noteTextExtractor";

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
      }))
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
      const validatedData = createNoteSchema.parse(params);

      // Create the base note record and first version in a transaction
      const newNote = await prisma.$transaction(async (tx) => {
        // Validate folder ownership if folderId is provided
        if (validatedData.folderId) {
          const folder = await tx.folder.findFirst({
            where: {
              id: validatedData.folderId,
              user_id: validatedData.userId,
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
            title: validatedData.title,
            user_id: validatedData.userId,
            folder_id: validatedData.folderId,
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
    }
  );

  /**
   * Get the notes for a system folder
   */
  private async getSystemFolderNotes(
    systemFolderId: string,
    userId: string
  ): Promise<Note[]> {
    switch (systemFolderId) {
      case SYSTEM_FOLDERS.SHARED.id:
        // get shared notes
        return await this.getSharedNotes(userId);

      case SYSTEM_FOLDERS.DELETED.id:
        // get deleted notes
        return await this.getDeletedNotes(userId);

      default:
        throw new NotFoundError(`Unknown system folder: ${systemFolderId}`);
    }
  }

  /**
   * Get all the notes in a folder
   */
  public getAllNotesInFolder = withErrorHandling(
    async (folderId: string, userId: string): Promise<Note[]> => {
      // validate request data
      const validatedData = getNotesInFolderSchema.parse({ folderId, userId });

      // check if this is a system folder, then return the system folder notes
      if (isSystemFolder(validatedData.folderId)) {
        return await this.getSystemFolderNotes(
          validatedData.folderId,
          validatedData.userId
        );
      }

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
        transformToNote(note)
      );
      return transformedNotes;
    }
  );

  /**
   * Get the rich text content given a note version
   */
  public getNoteVersionContent = withErrorHandling(
    async (versionId: string): Promise<any> => {
      // get the note content from the version ID
      const versionContent = await prisma.note_version.findUnique({
        where: {
          id: versionId,
        },
        select: {
          rich_text_content: true,
        },
      });

      if (!versionContent) {
        throw new NotFoundError("Note version not found");
      }

      return versionContent.rich_text_content;
    }
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
    }
  );

  // Get all Shared Notes
  public getSharedNotes = withErrorHandling(
    async (userId: string): Promise<Note[]> => {
      const validatedData = getSystemNotesSchema.parse({ userId });

      // Find all notes that have been shared with this user
      const sharedNotes = await prisma.note.findMany({
        where: {
          permissions: {
            some: {
              shared_with_user_id: validatedData.userId,
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
        transformToNote(note)
      );
      return transformedSharedNotes;
    }
  );

  // Get all Deleted Notes
  public getDeletedNotes = withErrorHandling(
    async (userId: string): Promise<Note[]> => {
      const validatedData = getSystemNotesSchema.parse({ userId });

      // find all notes that have been soft deleted by this user
      const deletedNotes = await prisma.note.findMany({
        where: {
          is_deleted: true,
          user_id: validatedData.userId,
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
        transformToNote(note)
      );
      return transformedDeleted;
    }
  );

  // toggle the note to pinned/unpinned
  public togglePinNote = withErrorHandling(
    async (params: { noteId: string; userId: string }): Promise<PrismaNote> => {
      const validatedData = togglePinNoteSchema.parse(params);

      // Verify the note exists and belongs to the user
      const note = await prisma.note.findFirst({
        where: {
          id: validatedData.noteId,
          user_id: validatedData.userId,
          is_deleted: false,
        },
      });

      if (!note) {
        throw new NotFoundError("Note not found or access denied");
      }

      // toggle the notes pinned field
      const updatedNote = await prisma.note.update({
        where: {
          id: validatedData.noteId,
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
    }
  );

  // move not to another folder
  public moveNote = withErrorHandling(
    async (params: {
      noteId: string;
      folderId: string;
      userId: string;
    }): Promise<PrismaNote> => {
      const validatedData = moveNoteSchema.parse(params);

      // Verify the note exists and belongs to the user
      const note = await prisma.note.findFirst({
        where: {
          id: validatedData.noteId,
          user_id: validatedData.userId,
          is_deleted: false,
        },
      });

      if (!note) {
        throw new NotFoundError("Note not found or access denied");
      }

      // Verify the target folder exists and belongs to the user (if not null)
      if (validatedData.folderId) {
        const folder = await prisma.folder.findFirst({
          where: {
            id: validatedData.folderId,
            user_id: validatedData.userId,
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
          id: validatedData.noteId,
        },
        data: {
          folder_id: validatedData.folderId,
        },
      });
      return updatedNote;
    }
  );

  /**
   * Update the note's title
   */
  public updateNoteTitle = withErrorHandling(
    async (params: {
      noteId: string;
      title: string;
      userId: string;
    }): Promise<PrismaNote> => {
      const validatedData = updateNoteTitleSchema.parse(params);

      // Verify the note exists and belongs to the user
      const note = await prisma.note.findFirst({
        where: {
          id: validatedData.noteId,
          user_id: validatedData.userId,
          is_deleted: false,
        },
      });

      if (!note) {
        throw new NotFoundError("Note not found or access denied");
      }

      // Update the note title
      const updatedNote = await prisma.note.update({
        where: {
          id: validatedData.noteId,
        },
        data: {
          title: validatedData.title,
        },
      });

      return updatedNote;
    }
  );

  // soft delete note
  public deleteNote = withErrorHandling(
    async (params: { noteId: string; userId: string }): Promise<PrismaNote> => {
      const validatedData = deleteNoteSchema.parse(params);

      // Verify the note exists and belongs to the user
      const note = await prisma.note.findFirst({
        where: {
          id: validatedData.noteId,
          user_id: validatedData.userId,
          is_deleted: false, // can't delete already deleted notes
        },
      });

      if (!note) {
        throw new NotFoundError("Note not found or already deleted");
      }

      // Soft delete the note
      const deletedNote = await prisma.note.update({
        where: {
          id: validatedData.noteId,
        },
        data: {
          is_deleted: true,
        },
      });

      return deletedNote;
    }
  );

  /**
   * Update note content with both rich text and plain text versions
   * Used when saving note edits from the rich text editor
   */
  public updateNoteVersionContent = withErrorHandling(
    async (params: {
      versionId: string;
      richTextContent: any;
      userId: string;
    }): Promise<PrismaNoteVersion> => {
      const validatedData = updateNoteVersionContentSchema.parse(params);
      const { versionId, richTextContent, userId } = validatedData;

      // Verify the note version exists and belongs to the user
      const noteVersion = await prisma.note_version.findFirst({
        where: {
          id: versionId,
          note: {
            user_id: userId,
            is_deleted: false,
          },
        },
      });

      if (!noteVersion) {
        throw new NotFoundError("Note version not found or access denied");
      }

      // Extract plain text from rich text content
      const plainTextContent =
        NoteTextExtractor.extractPlainText(richTextContent);

      // Update the version with both rich text and plain text
      const savedNote = await prisma.note_version.update({
        where: { id: versionId },
        data: {
          rich_text_content: richTextContent,
          plain_text_content: plainTextContent,
        },
      });
      // return the saved note
      return savedNote;
    }
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
      const validatedData = getNoteContentSchema.parse(params);
      const versionContent = await prisma.note_version.findFirst({
        where: {
          id: validatedData.versionId,
          note: {
            is_deleted: false,
            user_id: validatedData.userId,
          },
        },
        select: {
          plain_text_content: true,
          rich_text_content: true,
        },
      });

      if (!versionContent) {
        throw new NotFoundError(
          `Note version not found for version ${validatedData.versionId} or access denied`
        );
      }

      return {
        plainTextContent: versionContent.plain_text_content,
        richTextContent: versionContent.rich_text_content,
      };
    }
  );

  /**
   * Get the note data
   */
  public getNoteById = withErrorHandling(
    async (params: { noteId: string; userId: string }): Promise<Note> => {
      const validatedData = getNoteSchema.parse(params);

      // Find note that user either owns OR has been shared with them
      const note = await prisma.note.findFirst({
        where: {
          id: validatedData.noteId,
          is_deleted: false,
          OR: [
            // User owns the note
            { user_id: validatedData.userId },
            // Note has been shared with the user
            {
              permissions: {
                some: {
                  shared_with_user_id: validatedData.userId,
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
          `Note not found for note ${validatedData.noteId} or access denied`
        );
      }

      // Enrich with preview
      const noteWithPreview = await this.enrichNotesWithPreviews([note]);

      // Transform and return
      return transformToNote(noteWithPreview[0]);
    }
  );

  /**
   * Get list of versions for a note using its ID
   */
  public getNoteVersions = withErrorHandling(
    async (params: {
      noteId: string;
      userId: string;
    }): Promise<PrismaNoteVersion[]> => {
      const validatedData = getNoteVersionsSchema.parse(params);

      // Get all versions of a note
      const noteVersions = await prisma.note_version.findMany({
        where: {
          note_id: validatedData.noteId,
          note: {
            is_deleted: false,
            user_id: validatedData.userId,
          },
        },
        orderBy: {
          version_number: "desc",
        },
      });

      if (!noteVersions) {
        throw new NotFoundError(
          `Note Versions not found for note ${validatedData.noteId} or access denied`
        );
      }

      return noteVersions;
    }
  );

  /**
   * Get the data for a specific note version
   */
  // public getNoteVersion = withErrorHandling(async () => {});
}

import { prisma } from "@/lib/prisma";
import {
  createNoteSchema,
  getNotesInFolderSchema,
  getSystemNotesSchema,
} from "./noteValidators";
import { Note, PrismaNote } from "@/lib/types/noteTypes";
import { NotFoundError } from "@/lib/errors/apiErrors";
import { withErrorHandling } from "@/lib/errors/errorHandlers";
import { transformToNote } from "./noteTransformers";
import { SYSTEM_FOLDERS } from "@/lib/types/folderTypes";
import { FolderService } from "../folder/folderService";

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

  // Create Note
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
            content: [{}],
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
      if (FolderService.isSystemFolder(validatedData.folderId)) {
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
   * Get the content given a note version
   */
  public getNoteVersionContent = withErrorHandling(
    async (versionId: string): Promise<any> => {
      // get the note content from the version ID
      const versionContent = await prisma.note_version.findUnique({
        where: {
          id: versionId,
        },
        select: {
          content: true,
        },
      });

      if (!versionContent) {
        throw new NotFoundError("Note version not found");
      }

      return versionContent.content;
    }
  );

  /**
   * Get the preview of a note given the version ID
   */
  public getNotePreview = withErrorHandling(
    async (versionId: string): Promise<string> => {
      const content = await this.getNoteVersionContent(versionId);

      // Handle empty or invalid content
      if (!content || !Array.isArray(content) || content.length === 0) {
        return "No content available";
      }

      // Get the first block
      const firstBlock = content[0];

      // Handle empty first block
      if (
        !firstBlock ||
        !firstBlock.content ||
        !Array.isArray(firstBlock.content)
      ) {
        return "No content available";
      }

      // Extract text from the first block's content
      let previewText = "";
      for (const contentItem of firstBlock.content) {
        if (contentItem.type === "text" && contentItem.text) {
          previewText += contentItem.text + " ";
        }
      }

      // Trim to approximately 100 characters at word boundary
      if (previewText.length > 100) {
        const truncated = previewText.substring(0, 100);
        const lastSpaceIndex = truncated.lastIndexOf(" ");
        previewText =
          lastSpaceIndex > 50
            ? truncated.substring(0, lastSpaceIndex) + "..."
            : truncated + "...";
      }

      return previewText || "No content available";
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
}

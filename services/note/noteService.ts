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
   * @param systemFolderId
   * @param userId
   * @returns system folder notes
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

  // Get All Notes In Foler
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

      // transform the notes into the correct type and structure
      const transformedNotes = notes.map((note) => transformToNote(note));
      return transformedNotes;
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

      // Transform the notes into the correct type and structure
      const transformedSharedNotes = sharedNotes.map((note) =>
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
      // transform response
      const transformedDeleted = deletedNotes.map((note) =>
        transformToNote(note)
      );
      return transformedDeleted;
    }
  );
}

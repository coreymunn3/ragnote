import { prisma } from "@/lib/prisma";
import {
  createNoteSchema,
  getNotesInFolderSchema,
  getSharedNotesSchema,
} from "./noteValidators";
import {
  CreateNoteRequest,
  GetNotesInFolderRequest,
  GetSharedNotesRequeset,
  Note,
  PrismaNote,
} from "@/lib/types/noteTypes";
import { NotFoundError } from "@/lib/errors/apiErrors";
import { withErrorHandling } from "@/lib/errors/errorHandlers";
import { transformToNote } from "./noteTransformers";

export class NoteService {
  // Create Note
  public createNote = withErrorHandling(
    async (data: CreateNoteRequest): Promise<PrismaNote> => {
      // Validate the request data
      const validatedData = createNoteSchema.parse(data);

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
            content: validatedData.content,
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

  // Get All Notes In Foler
  public getAllNotesInFolder = withErrorHandling(
    async (data: GetNotesInFolderRequest): Promise<Note[]> => {
      // validate request data
      const validatedData = getNotesInFolderSchema.parse(data);

      // get all notes in this folder
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
    async (data: GetSharedNotesRequeset): Promise<Note[]> => {
      const validatedData = getSharedNotesSchema.parse(data);

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
      const transformedNotes = sharedNotes.map((note) => transformToNote(note));
      return transformedNotes;
    }
  );

  // Get all Deleted Notes
}

import { prisma } from "@/lib/prisma";
import { createNoteSchema } from "./noteValidators";
import { CreateNoteRequest, NoteResponse } from "@/lib/types/noteTypes";
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "@/lib/errors/apiErrors";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export class NoteService {
  public async createNote(data: CreateNoteRequest): Promise<NoteResponse> {
    // Validate the request data
    const validatedData = createNoteSchema.parse(data);

    try {
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

      // Ensure current_version_id is set (should always be true after our transaction)
      if (!newNote.current_version_id) {
        throw new Error("Failed to set current version for new note");
      }

      return newNote as NoteResponse;
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof Error && error.name === "ZodError") {
        throw new BadRequestError(`Invalid input: ${error.message}`);
      }

      // Handle Prisma errors
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2002":
            throw new ConflictError(
              "A note with this information already exists"
            );
          case "P2003":
            throw new NotFoundError("Referenced folder does not exist");
          case "P2025":
            throw new NotFoundError("Record not found");
          default:
            console.error("Prisma error:", error);
            throw new Error("Database operation failed");
        }
      }

      // Re-throw known ApiErrors
      if (
        error instanceof NotFoundError ||
        error instanceof ConflictError ||
        error instanceof BadRequestError
      ) {
        throw error;
      }

      // Log unexpected errors and throw generic error
      console.error("Unexpected error in createNote:", error);
      throw new Error("Failed to create note");
    }
  }
}

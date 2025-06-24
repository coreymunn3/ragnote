import { prisma } from "@/lib/prisma";
import { createNoteSchema } from "./noteValidators";
import { CreateNoteRequest, NoteResponse } from "@/lib/types/noteTypes";
import { NotFoundError } from "@/lib/errors/apiErrors";
import { withErrorHandling } from "@/lib/errors/errorHandlers";

export class NoteService {
  public createNote = withErrorHandling(
    async (data: CreateNoteRequest): Promise<NoteResponse> => {
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

      // Ensure current_version_id is set (should always be true after our transaction)
      if (!newNote.current_version_id) {
        throw new Error("Failed to set current version for new note");
      }

      return newNote as NoteResponse;
    }
  );
}

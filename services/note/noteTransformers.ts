import { Note, PrismaNoteWithVersion } from "@/lib/types/noteTypes";

/**
 * Transforms a Prisma note result (with includes) to the Note type expected by the frontend
 */
export const transformToNote = (note: PrismaNoteWithVersion): Note => {
  if (!note.current_version) {
    throw new Error("Note must have a current version");
  }

  return {
    id: note.id,
    title: note.title,
    current_version: {
      id: note.current_version.id,
      version_number: note.current_version.version_number,
      is_published: note.current_version.is_published,
      published_at: note.current_version.published_at,
    },
    is_pinned: note.is_pinned,
    is_deleted: note.is_deleted,
    updated_at: note.updated_at,
    created_at: note.created_at,
    shared_with_count: note._count.permissions,
  };
};

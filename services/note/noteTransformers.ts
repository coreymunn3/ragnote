import { Note, PrismaNoteWithVersionPreview } from "@/lib/types/noteTypes";

/**
 * Transforms a Prisma note result (with includes) to the Note type expected by the frontend
 */
export const transformToNote = (note: PrismaNoteWithVersionPreview): Note => {
  if (!note.current_version) {
    throw new Error("Note must have a current version");
  }

  return {
    id: note.id,
    folder_id: note.folder_id!,
    title: note.title,
    current_version: {
      id: note.current_version.id,
      updated_at: note.current_version.updated_at,
      version_number: note.current_version.version_number,
      is_published: note.current_version.is_published,
      published_at: note.current_version.published_at,
    },
    is_pinned: note.is_pinned,
    is_deleted: note.is_deleted,
    updated_at: note.updated_at,
    created_at: note.created_at,
    preview: note.preview,
    // this is the main reason this transformation exists
    shared_with_count: note._count.permissions,
  };
};

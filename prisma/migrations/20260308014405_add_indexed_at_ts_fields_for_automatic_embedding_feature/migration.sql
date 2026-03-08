-- AlterTable
ALTER TABLE "note_version" ADD COLUMN     "last_indexed_at" TIMESTAMPTZ(3),
ADD COLUMN     "last_indexed_char_count" INTEGER DEFAULT 0;

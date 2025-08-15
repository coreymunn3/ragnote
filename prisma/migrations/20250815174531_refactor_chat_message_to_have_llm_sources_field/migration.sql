/*
  Warnings:

  - You are about to drop the column `referenced_file_chunk_ids` on the `chat_message` table. All the data in the column will be lost.
  - You are about to drop the column `referenced_note_chunk_ids` on the `chat_message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chat_message" DROP COLUMN "referenced_file_chunk_ids",
DROP COLUMN "referenced_note_chunk_ids",
ADD COLUMN     "llm_sources" JSONB;

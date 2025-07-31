/*
  Warnings:

  - You are about to drop the column `scope_folder_id` on the `chat_session` table. All the data in the column will be lost.
  - You are about to drop the column `scope_note_id` on the `chat_session` table. All the data in the column will be lost.
  - Added the required column `chat_scope` to the `chat_session` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "chat_session" DROP CONSTRAINT "chat_session_scope_folder_id_fkey";

-- DropForeignKey
ALTER TABLE "chat_session" DROP CONSTRAINT "chat_session_scope_note_id_fkey";

-- AlterTable
ALTER TABLE "chat_session" DROP COLUMN "scope_folder_id",
DROP COLUMN "scope_note_id",
ADD COLUMN     "chat_scope" JSONB NOT NULL,
ADD COLUMN     "folder_id" UUID,
ADD COLUMN     "note_id" UUID;

-- CreateIndex
CREATE INDEX "chat_session_chat_scope_idx" ON "chat_session"("chat_scope");

-- AddForeignKey
ALTER TABLE "chat_session" ADD CONSTRAINT "chat_session_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "note"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_session" ADD CONSTRAINT "chat_session_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

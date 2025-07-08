/*
  Warnings:

  - You are about to drop the column `content` on the `note_version` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "note_version" DROP COLUMN "content",
ADD COLUMN     "plain_text_content" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "rich_text_content" JSON NOT NULL DEFAULT '[]';

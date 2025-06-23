/*
  Warnings:

  - Changed the type of `content` on the `note_version` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "note_version" DROP COLUMN "content",
ADD COLUMN     "content" JSON NOT NULL;

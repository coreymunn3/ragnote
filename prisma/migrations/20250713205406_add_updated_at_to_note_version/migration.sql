/*
  Warnings:

  - Added the required column `updated_at` to the `note_version` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "note_version" ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL;

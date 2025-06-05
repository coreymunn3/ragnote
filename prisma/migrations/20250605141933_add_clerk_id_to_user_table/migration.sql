/*
  Warnings:

  - A unique constraint covering the columns `[clerk_id]` on the table `app_user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clerk_id` to the `app_user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "app_user" ADD COLUMN     "clerk_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "app_user_clerk_id_key" ON "app_user"("clerk_id");

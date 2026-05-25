/*
  Warnings:

  - You are about to drop the column `file_url` on the `file` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `file` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "file" DROP COLUMN "file_url",
ADD COLUMN     "file_size_bytes" INTEGER,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "is_processed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_indexed_at" TIMESTAMPTZ(3),
ADD COLUMN     "mime_type" TEXT,
ADD COLUMN     "processing_error" TEXT,
ADD COLUMN     "storage_key" TEXT,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "width" INTEGER;

-- AlterTable
ALTER TABLE "user_subscription" ADD COLUMN     "storage_used_bytes" BIGINT NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "file_user_id_is_deleted_idx" ON "file"("user_id", "is_deleted");

-- CreateIndex
CREATE INDEX "file_folder_id_idx" ON "file"("folder_id");

-- CreateIndex
CREATE INDEX "file_storage_key_idx" ON "file"("storage_key");

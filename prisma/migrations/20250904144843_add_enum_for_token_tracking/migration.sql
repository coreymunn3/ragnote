/*
  Warnings:

  - Changed the type of `operation_type` on the `llm_usage_log` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "LLMOperationType" AS ENUM ('CHAT_COMPLETION', 'EMBEDDING');

-- AlterTable
ALTER TABLE "llm_usage_log" DROP COLUMN "operation_type",
ADD COLUMN     "operation_type" "LLMOperationType" NOT NULL;

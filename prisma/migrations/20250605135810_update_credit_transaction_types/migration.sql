/*
  Warnings:

  - The values [DEBIT_AI_ACTION] on the enum `CreditTransactionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CreditTransactionType_new" AS ENUM ('AWARD_MONTHLY', 'AWARD_PURCHASE', 'AI_ACTION', 'BONUS', 'REFUND');
ALTER TABLE "credit_transaction" ALTER COLUMN "transaction_type" TYPE "CreditTransactionType_new" USING ("transaction_type"::text::"CreditTransactionType_new");
ALTER TYPE "CreditTransactionType" RENAME TO "CreditTransactionType_old";
ALTER TYPE "CreditTransactionType_new" RENAME TO "CreditTransactionType";
DROP TYPE "CreditTransactionType_old";
COMMIT;

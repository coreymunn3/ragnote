/*
  Warnings:

  - You are about to drop the `credit_transaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "credit_transaction" DROP CONSTRAINT "credit_transaction_user_id_fkey";

-- DropTable
DROP TABLE "credit_transaction";

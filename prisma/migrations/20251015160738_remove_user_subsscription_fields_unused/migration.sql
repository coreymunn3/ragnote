/*
  Warnings:

  - You are about to drop the column `renewal_date` on the `user_subscription` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `user_subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_subscription" DROP COLUMN "renewal_date",
DROP COLUMN "start_date";

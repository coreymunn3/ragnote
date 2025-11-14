/*
  Warnings:

  - You are about to drop the column `status` on the `user_subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_subscription" DROP COLUMN "status";

-- DropEnum
DROP TYPE "SubscriptionStatus";

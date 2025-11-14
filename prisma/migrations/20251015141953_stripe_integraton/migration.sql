/*
  Warnings:

  - You are about to drop the column `last_credit_award_date` on the `user_subscription` table. All the data in the column will be lost.
  - You are about to drop the column `monthly_credits_awarded` on the `user_subscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripe_customer_id]` on the table `app_user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripe_subscription_id]` on the table `user_subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "app_user" ADD COLUMN     "stripe_customer_id" TEXT;

-- AlterTable
ALTER TABLE "user_subscription" DROP COLUMN "last_credit_award_date",
DROP COLUMN "monthly_credits_awarded",
ADD COLUMN     "stripe_price_id" TEXT,
ADD COLUMN     "stripe_subscription_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "app_user_stripe_customer_id_key" ON "app_user"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_subscription_stripe_subscription_id_key" ON "user_subscription"("stripe_subscription_id");

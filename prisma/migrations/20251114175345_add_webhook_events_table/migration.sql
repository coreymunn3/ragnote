-- CreateEnum
CREATE TYPE "WebhookProvider" AS ENUM ('CLERK', 'STRIPE');

-- DropEnum
DROP TYPE "CreditTransactionType";

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" UUID NOT NULL,
    "provider" "WebhookProvider" NOT NULL,
    "webhook_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "processed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_provider_webhook_id_key" ON "webhook_events"("provider", "webhook_id");

/*
  Warnings:

  - Added the required column `event_payload` to the `webhook_events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "webhook_events" ADD COLUMN     "event_payload" JSONB NOT NULL;

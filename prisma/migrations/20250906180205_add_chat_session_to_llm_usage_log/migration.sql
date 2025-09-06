-- AlterTable
ALTER TABLE "llm_usage_log" ADD COLUMN     "chat_session_id" UUID;

-- AddForeignKey
ALTER TABLE "llm_usage_log" ADD CONSTRAINT "llm_usage_log_chat_session_id_fkey" FOREIGN KEY ("chat_session_id") REFERENCES "chat_session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

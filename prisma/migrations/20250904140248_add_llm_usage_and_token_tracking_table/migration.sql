-- CreateTable
CREATE TABLE "llm_usage_log" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "model_name" TEXT NOT NULL,
    "operation_type" TEXT NOT NULL,
    "prompt_tokens" INTEGER NOT NULL,
    "completion_tokens" INTEGER,
    "total_tokens" INTEGER NOT NULL,
    "chat_message_id" UUID,
    "note_version_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "llm_usage_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "llm_usage_log_user_id_created_at_idx" ON "llm_usage_log"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "llm_usage_log_chat_message_id_idx" ON "llm_usage_log"("chat_message_id");

-- AddForeignKey
ALTER TABLE "llm_usage_log" ADD CONSTRAINT "llm_usage_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "llm_usage_log" ADD CONSTRAINT "llm_usage_log_chat_message_id_fkey" FOREIGN KEY ("chat_message_id") REFERENCES "chat_message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "llm_usage_log" ADD CONSTRAINT "llm_usage_log_note_version_id_fkey" FOREIGN KEY ("note_version_id") REFERENCES "note_version"("id") ON DELETE SET NULL ON UPDATE CASCADE;

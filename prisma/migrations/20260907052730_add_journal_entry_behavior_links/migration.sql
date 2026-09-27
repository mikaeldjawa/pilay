-- CreateTable
CREATE TABLE "counselor_journal_entry_behavior_records" (
    "id" TEXT NOT NULL,
    "journal_entry_id" TEXT NOT NULL,
    "behavior_record_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "counselor_journal_entry_behavior_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "counselor_journal_entry_behavior_records_behavior_record_id_idx" ON "counselor_journal_entry_behavior_records"("behavior_record_id");

-- CreateIndex
CREATE UNIQUE INDEX "counselor_journal_entry_behavior_records_journal_entry_id_b_key" ON "counselor_journal_entry_behavior_records"("journal_entry_id", "behavior_record_id");

-- AddForeignKey
ALTER TABLE "counselor_journal_entry_behavior_records" ADD CONSTRAINT "counselor_journal_entry_behavior_records_journal_entry_id_fkey" FOREIGN KEY ("journal_entry_id") REFERENCES "counselor_journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counselor_journal_entry_behavior_records" ADD CONSTRAINT "counselor_journal_entry_behavior_records_behavior_record_i_fkey" FOREIGN KEY ("behavior_record_id") REFERENCES "behavior_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

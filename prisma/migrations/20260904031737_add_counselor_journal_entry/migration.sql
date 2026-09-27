-- CreateTable
CREATE TABLE "counselor_journal_entries" (
    "id" TEXT NOT NULL,
    "author_user_id" TEXT NOT NULL,
    "entry_date" DATE NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "counselor_journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "counselor_journal_entries_author_user_id_deleted_at_entry_d_idx" ON "counselor_journal_entries"("author_user_id", "deleted_at", "entry_date");

-- AddForeignKey
ALTER TABLE "counselor_journal_entries" ADD CONSTRAINT "counselor_journal_entries_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

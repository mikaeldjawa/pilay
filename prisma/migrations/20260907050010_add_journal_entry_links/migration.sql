-- CreateTable
CREATE TABLE "counselor_journal_entry_sessions" (
    "id" TEXT NOT NULL,
    "journal_entry_id" TEXT NOT NULL,
    "counseling_session_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "counselor_journal_entry_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counselor_journal_entry_incidents" (
    "id" TEXT NOT NULL,
    "journal_entry_id" TEXT NOT NULL,
    "incident_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "counselor_journal_entry_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "counselor_journal_entry_sessions_counseling_session_id_idx" ON "counselor_journal_entry_sessions"("counseling_session_id");

-- CreateIndex
CREATE UNIQUE INDEX "counselor_journal_entry_sessions_journal_entry_id_counselin_key" ON "counselor_journal_entry_sessions"("journal_entry_id", "counseling_session_id");

-- CreateIndex
CREATE INDEX "counselor_journal_entry_incidents_incident_id_idx" ON "counselor_journal_entry_incidents"("incident_id");

-- CreateIndex
CREATE UNIQUE INDEX "counselor_journal_entry_incidents_journal_entry_id_incident_key" ON "counselor_journal_entry_incidents"("journal_entry_id", "incident_id");

-- AddForeignKey
ALTER TABLE "counselor_journal_entry_sessions" ADD CONSTRAINT "counselor_journal_entry_sessions_journal_entry_id_fkey" FOREIGN KEY ("journal_entry_id") REFERENCES "counselor_journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counselor_journal_entry_sessions" ADD CONSTRAINT "counselor_journal_entry_sessions_counseling_session_id_fkey" FOREIGN KEY ("counseling_session_id") REFERENCES "counseling_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counselor_journal_entry_incidents" ADD CONSTRAINT "counselor_journal_entry_incidents_journal_entry_id_fkey" FOREIGN KEY ("journal_entry_id") REFERENCES "counselor_journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counselor_journal_entry_incidents" ADD CONSTRAINT "counselor_journal_entry_incidents_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

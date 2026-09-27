-- CreateIndex
CREATE INDEX "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at");

-- CreateIndex
CREATE INDEX "behavior_records_record_date_idx" ON "behavior_records"("record_date");

-- CreateIndex
CREATE INDEX "counseling_sessions_student_id_idx" ON "counseling_sessions"("student_id");

-- CreateIndex
CREATE INDEX "documents_student_id_idx" ON "documents"("student_id");

-- CreateIndex
CREATE INDEX "documents_document_category_id_idx" ON "documents"("document_category_id");

-- CreateIndex
CREATE INDEX "documents_deleted_at_created_at_idx" ON "documents"("deleted_at", "created_at");

-- CreateIndex
CREATE INDEX "follow_ups_student_id_idx" ON "follow_ups"("student_id");

-- CreateIndex
CREATE INDEX "generated_reports_report_type_status_idx" ON "generated_reports"("report_type", "status");

-- CreateIndex
CREATE INDEX "generated_reports_created_at_idx" ON "generated_reports"("created_at");

-- CreateIndex
CREATE INDEX "incidents_primary_student_id_idx" ON "incidents"("primary_student_id");

-- CreateIndex
CREATE INDEX "incidents_status_idx" ON "incidents"("status");

-- CreateIndex
CREATE INDEX "parent_contacts_student_id_deleted_at_contact_date_idx" ON "parent_contacts"("student_id", "deleted_at", "contact_date");

-- CreateIndex
CREATE INDEX "parent_contacts_related_incident_id_idx" ON "parent_contacts"("related_incident_id");

-- CreateIndex
CREATE INDEX "students_status_idx" ON "students"("status");

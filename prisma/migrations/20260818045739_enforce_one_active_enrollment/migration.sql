-- Enforce at most one active (end_date IS NULL) enrollment per student.
-- Prisma cannot express a partial unique index natively, so it's added here as raw SQL.
CREATE UNIQUE INDEX "student_enrollments_one_active_per_student"
  ON "student_enrollments" ("student_id")
  WHERE "end_date" IS NULL;
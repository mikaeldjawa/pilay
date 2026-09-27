-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "teaching_plan_week_id" TEXT;

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teaching_plans" (
    "id" TEXT NOT NULL,
    "academic_year_id" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "class_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "week_count" INTEGER NOT NULL DEFAULT 18,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teaching_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teaching_plan_weeks" (
    "id" TEXT NOT NULL,
    "teaching_plan_id" TEXT NOT NULL,
    "week_number" INTEGER NOT NULL,
    "topic" TEXT,
    "learning_objective" TEXT,
    "detail_plan" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teaching_plan_weeks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teaching_plan_lessons" (
    "id" TEXT NOT NULL,
    "teaching_plan_week_id" TEXT NOT NULL,
    "sequence_order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teaching_plan_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subjects_name_key" ON "subjects"("name");

-- CreateIndex
CREATE INDEX "teaching_plans_deleted_at_created_at_idx" ON "teaching_plans"("deleted_at", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "teaching_plans_academic_year_id_semester_class_id_subject_i_key" ON "teaching_plans"("academic_year_id", "semester", "class_id", "subject_id", "teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "teaching_plan_weeks_teaching_plan_id_week_number_key" ON "teaching_plan_weeks"("teaching_plan_id", "week_number");

-- CreateIndex
CREATE INDEX "teaching_plan_lessons_teaching_plan_week_id_idx" ON "teaching_plan_lessons"("teaching_plan_week_id");

-- CreateIndex
CREATE INDEX "documents_teaching_plan_week_id_idx" ON "documents"("teaching_plan_week_id");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_teaching_plan_week_id_fkey" FOREIGN KEY ("teaching_plan_week_id") REFERENCES "teaching_plan_weeks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_plans" ADD CONSTRAINT "teaching_plans_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_plans" ADD CONSTRAINT "teaching_plans_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_plans" ADD CONSTRAINT "teaching_plans_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_plans" ADD CONSTRAINT "teaching_plans_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_plan_weeks" ADD CONSTRAINT "teaching_plan_weeks_teaching_plan_id_fkey" FOREIGN KEY ("teaching_plan_id") REFERENCES "teaching_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teaching_plan_lessons" ADD CONSTRAINT "teaching_plan_lessons_teaching_plan_week_id_fkey" FOREIGN KEY ("teaching_plan_week_id") REFERENCES "teaching_plan_weeks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

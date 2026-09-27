-- DropForeignKey
ALTER TABLE "generated_reports" DROP CONSTRAINT "generated_reports_student_id_fkey";

-- AlterTable
ALTER TABLE "generated_reports" ALTER COLUMN "student_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "generated_reports" ADD CONSTRAINT "generated_reports_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

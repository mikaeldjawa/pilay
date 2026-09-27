-- DropIndex
DROP INDEX "students_last_name_first_name_idx";

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "middle_name" TEXT;

-- CreateIndex
CREATE INDEX "students_first_name_last_name_idx" ON "students"("first_name", "last_name");

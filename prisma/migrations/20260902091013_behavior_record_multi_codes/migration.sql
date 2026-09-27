-- CreateTable
CREATE TABLE "behavior_record_categories" (
    "id" TEXT NOT NULL,
    "behavior_record_id" TEXT NOT NULL,
    "behavior_category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "behavior_record_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "behavior_record_actions" (
    "id" TEXT NOT NULL,
    "behavior_record_id" TEXT NOT NULL,
    "action_code_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "behavior_record_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "behavior_record_categories_behavior_category_id_idx" ON "behavior_record_categories"("behavior_category_id");

-- CreateIndex
CREATE UNIQUE INDEX "behavior_record_categories_behavior_record_id_behavior_cate_key" ON "behavior_record_categories"("behavior_record_id", "behavior_category_id");

-- CreateIndex
CREATE INDEX "behavior_record_actions_action_code_id_idx" ON "behavior_record_actions"("action_code_id");

-- CreateIndex
CREATE UNIQUE INDEX "behavior_record_actions_behavior_record_id_action_code_id_key" ON "behavior_record_actions"("behavior_record_id", "action_code_id");

-- AddForeignKey
ALTER TABLE "behavior_record_categories" ADD CONSTRAINT "behavior_record_categories_behavior_record_id_fkey" FOREIGN KEY ("behavior_record_id") REFERENCES "behavior_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavior_record_categories" ADD CONSTRAINT "behavior_record_categories_behavior_category_id_fkey" FOREIGN KEY ("behavior_category_id") REFERENCES "behavior_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavior_record_actions" ADD CONSTRAINT "behavior_record_actions_behavior_record_id_fkey" FOREIGN KEY ("behavior_record_id") REFERENCES "behavior_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavior_record_actions" ADD CONSTRAINT "behavior_record_actions_action_code_id_fkey" FOREIGN KEY ("action_code_id") REFERENCES "action_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DataMigration: carry every existing single behavior_category_id/action_code_id
-- over into the new junction tables before the source columns are dropped, so
-- historical minor-behavior logs keep their code(s) under the new multi-select model.
INSERT INTO "behavior_record_categories" ("id", "behavior_record_id", "behavior_category_id", "created_at")
SELECT gen_random_uuid(), "id", "behavior_category_id", "created_at"
FROM "behavior_records"
WHERE "behavior_category_id" IS NOT NULL;

INSERT INTO "behavior_record_actions" ("id", "behavior_record_id", "action_code_id", "created_at")
SELECT gen_random_uuid(), "id", "action_code_id", "created_at"
FROM "behavior_records"
WHERE "action_code_id" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "behavior_records" DROP CONSTRAINT "behavior_records_action_code_id_fkey";

-- DropForeignKey
ALTER TABLE "behavior_records" DROP CONSTRAINT "behavior_records_behavior_category_id_fkey";

-- DropIndex
DROP INDEX "behavior_records_student_id_behavior_category_id_record_dat_idx";

-- AlterTable
ALTER TABLE "behavior_records" DROP COLUMN "action_code_id",
DROP COLUMN "behavior_category_id";

-- CreateIndex
CREATE INDEX "behavior_records_student_id_record_date_idx" ON "behavior_records"("student_id", "record_date");

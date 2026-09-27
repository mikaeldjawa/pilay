-- AlterTable
ALTER TABLE "behavior_records" DROP COLUMN "action_code",
ADD COLUMN     "action_code_id" TEXT;

-- DropEnum
DROP TYPE "ActionCode";

-- CreateTable
CREATE TABLE "action_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "action_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "action_codes_code_key" ON "action_codes"("code");

-- AddForeignKey
ALTER TABLE "behavior_records" ADD CONSTRAINT "behavior_records_action_code_id_fkey" FOREIGN KEY ("action_code_id") REFERENCES "action_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;


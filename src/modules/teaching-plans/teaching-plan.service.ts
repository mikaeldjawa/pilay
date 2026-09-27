import { db } from "@/lib/db";
import { logAudit } from "@/modules/audit/audit.service";
import { isUniqueConstraintViolation } from "@/lib/prisma-errors";
import { uploadDocument } from "@/modules/documents/document.service";
import type {
  CreateTeachingPlanInput,
  UpdateTeachingPlanInput,
  UpdateWeekInput,
} from "@/modules/teaching-plans/teaching-plan.schema";

export class TeachingPlanServiceError extends Error {}

export async function createTeachingPlan(
  input: CreateTeachingPlanInput,
  userId: string,
) {
  const teacherId = input.teacherId || userId;
  try {
    return await db.$transaction(async (tx) => {
      const plan = await tx.teachingPlan.create({
        data: {
          academicYearId: input.academicYearId,
          semester: Number(input.semester),
          classId: input.classId,
          subjectId: input.subjectId,
          teacherId,
          title: input.title || null,
          weekCount: input.weekCount,
        },
      });

      // Auto-generate the semester's weeks so teachers never create them by hand.
      await tx.teachingPlanWeek.createMany({
        data: Array.from({ length: input.weekCount }, (_, i) => ({
          teachingPlanId: plan.id,
          weekNumber: i + 1,
        })),
      });

      await logAudit(tx, {
        userId,
        action: "CREATE",
        entityType: "teaching_plan",
        entityId: plan.id,
      });

      return plan;
    });
  } catch (error) {
    if (isUniqueConstraintViolation(error)) {
      throw new TeachingPlanServiceError(
        "A teaching plan already exists for this academic year, semester, class, subject, and teacher.",
      );
    }
    throw error;
  }
}

export async function updateTeachingPlan(
  id: string,
  input: UpdateTeachingPlanInput,
  userId: string,
) {
  return db.$transaction(async (tx) => {
    const plan = await tx.teachingPlan.update({
      where: { id },
      data: {
        title: input.title || null,
        description: input.description || null,
      },
    });

    await logAudit(tx, {
      userId,
      action: "UPDATE",
      entityType: "teaching_plan",
      entityId: plan.id,
    });

    return plan;
  });
}

export async function archiveTeachingPlan(id: string, deletedBy: string) {
  return db.$transaction(async (tx) => {
    const plan = await tx.teachingPlan.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });

    await logAudit(tx, {
      userId: deletedBy,
      action: "ARCHIVE",
      entityType: "teaching_plan",
      entityId: plan.id,
    });

    return plan;
  });
}

export async function updateWeek(
  weekId: string,
  input: UpdateWeekInput,
  userId: string,
) {
  return db.$transaction(async (tx) => {
    const week = await tx.teachingPlanWeek.update({
      where: { id: weekId },
      data: {
        topic: input.topic || null,
        learningObjective: input.learningObjective || null,
        detailPlan: input.detailPlan || null,
      },
    });

    // Replace-all for lessons — same approach as counseling's repeating rows.
    await tx.teachingPlanLesson.deleteMany({ where: { teachingPlanWeekId: weekId } });
    if (input.lessons.length) {
      await tx.teachingPlanLesson.createMany({
        data: input.lessons.map((row, i) => ({
          teachingPlanWeekId: weekId,
          sequenceOrder: i,
          title: row.title,
          description: row.description || null,
          content: row.content || null,
        })),
      });
    }

    await logAudit(tx, {
      userId,
      action: "UPDATE",
      entityType: "teaching_plan_week",
      entityId: week.id,
    });

    return week;
  });
}

// Materials reuse the existing Document storage system. We resolve (or create)
// a dedicated "Teaching Material" document category rather than forcing the
// teacher to pick one.
async function resolveTeachingMaterialCategoryId(): Promise<string> {
  const existing = await db.documentCategory.findFirst({
    where: { name: "Teaching Material" },
  });
  if (existing) return existing.id;
  const created = await db.documentCategory.create({
    data: { name: "Teaching Material" },
  });
  return created.id;
}

export async function attachMaterial(
  weekId: string,
  title: string,
  file: { name: string; type: string; size: number; buffer: Buffer },
  userId: string,
) {
  const documentCategoryId = await resolveTeachingMaterialCategoryId();
  const document = await uploadDocument(
    { documentCategoryId, title: title || file.name, studentId: "" },
    file,
    userId,
  );
  // uploadDocument doesn't know about teaching plans — link the FK afterwards.
  return db.document.update({
    where: { id: document.id },
    data: { teachingPlanWeekId: weekId },
  });
}

export async function removeMaterial(documentId: string, deletedBy: string) {
  return db.$transaction(async (tx) => {
    const document = await tx.document.update({
      where: { id: documentId },
      data: { deletedAt: new Date(), deletedBy },
    });

    await logAudit(tx, {
      userId: deletedBy,
      action: "ARCHIVE",
      entityType: "document",
      entityId: document.id,
    });

    return document;
  });
}

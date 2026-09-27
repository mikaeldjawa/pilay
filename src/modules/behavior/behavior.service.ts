import { db } from "@/lib/db";
import { logAudit } from "@/modules/audit/audit.service";
import { CHRONIC_THRESHOLD, CHRONIC_WINDOW_DAYS } from "@/lib/constants";
import type { Prisma } from "@/generated/prisma/client";
import type {
  CreateBehaviorRecordInput,
  UpdateBehaviorRecordInput,
} from "@/modules/behavior/behavior.schema";

export class BehaviorServiceError extends Error {}

export type ChronicPattern = {
  studentId: string;
  behaviorCategoryId: string;
  count: number;
  isChronic: boolean;
  recordIds: string[];
};

function windowStart() {
  const date = new Date();
  date.setDate(date.getDate() - CHRONIC_WINDOW_DAYS);
  return date;
}

// Corrected rule (ER Update §6): 3+ occurrences of the same behavior code by
// the same student within 14 days, computed at read time — never stored, so
// backdated edits or corrections can't leave the pattern flag stale. Counts
// through the behavior_record_categories junction table so a record tagged
// with multiple codes counts as one occurrence of each of its codes.
export async function checkChronicPattern(
  studentId: string,
  behaviorCategoryId: string,
): Promise<ChronicPattern> {
  const selections = await db.behaviorRecordCategory.findMany({
    where: {
      behaviorCategoryId,
      behaviorRecord: {
        studentId,
        recordDate: { gte: windowStart() },
        deletedAt: null,
        incidentId: null,
      },
    },
    select: { behaviorRecordId: true },
  });

  const count = selections.length;
  return {
    studentId,
    behaviorCategoryId,
    count,
    isChronic: count >= CHRONIC_THRESHOLD,
    recordIds: selections.map((s) => s.behaviorRecordId),
  };
}

// Batched version of checkChronicPattern for callers evaluating many
// (studentId, behaviorCategoryId) pairs at once (e.g. building a report over
// hundreds of records) — one query instead of one per pair, grouped in JS
// since Prisma can't groupBy a field on the related behaviorRecord. Note the
// chronic window is always "now - 14 days" (never relative to a record's own
// date), so every record sharing a pair gets the identical answer — safe to
// compute once per distinct pair and reuse.
export async function getChronicCountsForPairs(
  pairs: { studentId: string; behaviorCategoryId: string }[],
): Promise<Map<string, { count: number; isChronic: boolean }>> {
  const uniquePairs = Array.from(
    new Map(pairs.map((p) => [`${p.studentId}:${p.behaviorCategoryId}`, p])).values(),
  );
  if (uniquePairs.length === 0) return new Map();

  const studentIds = Array.from(new Set(uniquePairs.map((p) => p.studentId)));
  const categoryIds = Array.from(new Set(uniquePairs.map((p) => p.behaviorCategoryId)));

  const selections = await db.behaviorRecordCategory.findMany({
    where: {
      behaviorCategoryId: { in: categoryIds },
      behaviorRecord: {
        studentId: { in: studentIds },
        recordDate: { gte: windowStart() },
        deletedAt: null,
        incidentId: null,
      },
    },
    select: { behaviorCategoryId: true, behaviorRecord: { select: { studentId: true } } },
  });

  const countByKey = new Map<string, number>();
  for (const s of selections) {
    const key = `${s.behaviorRecord.studentId}:${s.behaviorCategoryId}`;
    countByKey.set(key, (countByKey.get(key) ?? 0) + 1);
  }

  const result = new Map<string, { count: number; isChronic: boolean }>();
  for (const p of uniquePairs) {
    const key = `${p.studentId}:${p.behaviorCategoryId}`;
    const count = countByKey.get(key) ?? 0;
    result.set(key, { count, isChronic: count >= CHRONIC_THRESHOLD });
  }
  return result;
}

// Bulk "which of these students currently have a chronic minor pattern in
// any category" check — used to flag rows in the incidents list without
// running checkChronicPattern per student per category one at a time.
export async function getChronicStudentIds(studentIds: string[]): Promise<Set<string>> {
  const uniqueStudentIds = Array.from(new Set(studentIds));
  if (uniqueStudentIds.length === 0) return new Set();

  const categories = await db.behaviorCategory.findMany({
    where: { type: "NEGATIVE" },
    select: { id: true },
  });
  if (categories.length === 0) return new Set();

  const pairs = uniqueStudentIds.flatMap((studentId) =>
    categories.map((c) => ({ studentId, behaviorCategoryId: c.id })),
  );
  const counts = await getChronicCountsForPairs(pairs);

  const result = new Set<string>();
  for (const studentId of uniqueStudentIds) {
    const isChronic = categories.some(
      (c) => counts.get(`${studentId}:${c.id}`)?.isChronic,
    );
    if (isChronic) result.add(studentId);
  }
  return result;
}

export async function getChronicPatternsForStudent(studentId: string): Promise<ChronicPattern[]> {
  const categories = await db.behaviorCategory.findMany({
    where: { type: "NEGATIVE" },
    select: { id: true },
  });

  const patterns = await Promise.all(
    categories.map((c) => checkChronicPattern(studentId, c.id)),
  );

  return patterns.filter((p) => p.isChronic);
}

export async function createBehaviorRecord(input: CreateBehaviorRecordInput, recordedByUserId: string) {
  const academicYear = await db.academicYear.findFirst({ where: { isCurrent: true } });
  if (!academicYear) {
    throw new BehaviorServiceError("No current academic year is configured.");
  }

  const categoryIds = input.behaviorCategoryIds;
  const actionIds = input.actionCodeIds;
  // "Other, please specify" is kept as plain text on the record — it never
  // becomes a new BehaviorCategory/ActionCode row, so it can't show up in
  // the pick list for future entries and doesn't participate in
  // chronic-pattern counting (which only tracks real codes).
  const otherBehaviorText = input.behaviorCategoryOther?.trim() || null;
  const otherActionText = input.actionCodeOther?.trim() || null;

  const record = await db.$transaction(async (tx) => {
    const created = await tx.behaviorRecord.create({
      data: {
        studentId: input.studentId,
        recordDate: new Date(input.recordDate),
        recordTime: input.recordTime || null,
        classroomReference: input.classroomReference || null,
        description: input.description || null,
        otherBehaviorText,
        otherActionText,
        recordedByUserId,
        academicYearId: academicYear.id,
      },
    });

    if (categoryIds.length) {
      await tx.behaviorRecordCategory.createMany({
        data: categoryIds.map((behaviorCategoryId) => ({ behaviorRecordId: created.id, behaviorCategoryId })),
      });
    }
    if (actionIds.length) {
      await tx.behaviorRecordAction.createMany({
        data: actionIds.map((actionCodeId) => ({ behaviorRecordId: created.id, actionCodeId })),
      });
    }

    await logAudit(tx, {
      userId: recordedByUserId,
      action: "CREATE",
      entityType: "behavior_record",
      entityId: created.id,
    });

    return created;
  });

  const patterns = await Promise.all(
    categoryIds.map((behaviorCategoryId) => checkChronicPattern(input.studentId, behaviorCategoryId)),
  );
  const pattern = patterns.find((p) => p.isChronic) ?? patterns[0] ?? null;
  return { record, pattern };
}

export async function updateBehaviorRecord(
  id: string,
  input: UpdateBehaviorRecordInput,
  actorUserId: string,
) {
  const categoryIds = input.behaviorCategoryIds;
  const actionIds = input.actionCodeIds;
  const otherBehaviorText = input.behaviorCategoryOther?.trim() || null;
  const otherActionText = input.actionCodeOther?.trim() || null;

  const record = await db.$transaction(async (tx) => {
    const updated = await tx.behaviorRecord.update({
      where: { id },
      data: {
        recordDate: new Date(input.recordDate),
        recordTime: input.recordTime || null,
        classroomReference: input.classroomReference || null,
        description: input.description || null,
        otherBehaviorText,
        otherActionText,
      },
    });

    await tx.behaviorRecordCategory.deleteMany({ where: { behaviorRecordId: id } });
    if (categoryIds.length) {
      await tx.behaviorRecordCategory.createMany({
        data: categoryIds.map((behaviorCategoryId) => ({ behaviorRecordId: id, behaviorCategoryId })),
      });
    }

    await tx.behaviorRecordAction.deleteMany({ where: { behaviorRecordId: id } });
    if (actionIds.length) {
      await tx.behaviorRecordAction.createMany({
        data: actionIds.map((actionCodeId) => ({ behaviorRecordId: id, actionCodeId })),
      });
    }

    await logAudit(tx, {
      userId: actorUserId,
      action: "UPDATE",
      entityType: "behavior_record",
      entityId: updated.id,
    });

    return updated;
  });

  const patterns = await Promise.all(
    categoryIds.map((behaviorCategoryId) => checkChronicPattern(record.studentId, behaviorCategoryId)),
  );
  const pattern = patterns.find((p) => p.isChronic) ?? patterns[0] ?? null;
  return { record, pattern };
}

export async function archiveBehaviorRecord(id: string, deletedBy: string) {
  return db.$transaction(async (tx) => {
    const record = await tx.behaviorRecord.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });

    await logAudit(tx, {
      userId: deletedBy,
      action: "ARCHIVE",
      entityType: "behavior_record",
      entityId: record.id,
    });

    return record;
  });
}

export async function escalateToMajorIncident(
  behaviorRecordIds: string[],
  incidentId: string,
  client: Prisma.TransactionClient | typeof db = db,
) {
  if (!behaviorRecordIds.length) return;
  await client.behaviorRecord.updateMany({
    where: { id: { in: behaviorRecordIds } },
    data: { incidentId },
  });
}

import { db } from "@/lib/db";
import { logAudit } from "@/modules/audit/audit.service";
import { isUniqueConstraintViolation, uniqueConstraintFields } from "@/lib/prisma-errors";
import type { Prisma } from "@/generated/prisma/client";
import type {
  CreateSimpleLookupInput,
  UpdateSimpleLookupInput,
  CreateBehaviorCategoryInput,
  UpdateBehaviorCategoryInput,
  CreateAcademicYearInput,
  UpdateAcademicYearInput,
  CreateGradeInput,
  UpdateGradeInput,
  CreateClassInput,
  UpdateClassInput,
  CreateReportingPeriodInput,
  UpdateReportingPeriodInput,
} from "@/modules/settings/settings.schema";

export const SETTING_KEYS = {
  SCHOOL_NAME: "school_name",
  CONFIDENTIALITY_NOTICE: "confidentiality_notice",
  TIMEZONE: "timezone",
} as const;

export class SettingsServiceError extends Error {}

function friendlyUniqueMessage(error: unknown): string {
  const targetStr = uniqueConstraintFields(error).join(",");
  if (targetStr.includes("code")) return "That code is already in use.";
  if (targetStr.includes("name") && targetStr.includes("academic_year")) {
    return "A class with this name already exists for that academic year.";
  }
  if (targetStr.includes("name")) return "That name is already in use.";
  return "That value is already in use.";
}

function throwFriendlyUniqueError(error: unknown): never {
  if (isUniqueConstraintViolation(error)) {
    throw new SettingsServiceError(friendlyUniqueMessage(error));
  }
  throw error;
}

export async function listSettings() {
  const rows = await db.systemSetting.findMany({ orderBy: { key: "asc" } });
  return rows;
}

export async function updateSetting(key: string, value: string, userId: string) {
  const setting = await db.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  await logAudit(db, {
    userId,
    action: "UPDATE",
    entityType: "system_setting",
    entityId: setting.id,
    metadata: { key },
  });

  return setting;
}

// ---------------------------------------------------------------------------
// Simple lookup tables (code/name/description/isActive-shaped)
// ---------------------------------------------------------------------------

async function createLookupRow<T extends { id: string }>(
  entityType: string,
  userId: string,
  create: (tx: Prisma.TransactionClient) => Promise<T>,
) {
  try {
    return await db.$transaction(async (tx) => {
      const row = await create(tx);
      await logAudit(tx, { userId, action: "CREATE", entityType, entityId: row.id });
      return row;
    });
  } catch (error) {
    return throwFriendlyUniqueError(error);
  }
}

async function setLookupRowActive<T extends { id: string }>(
  entityType: string,
  userId: string,
  isActive: boolean,
  update: (tx: Prisma.TransactionClient) => Promise<T>,
) {
  return db.$transaction(async (tx) => {
    const row = await update(tx);
    await logAudit(tx, { userId, action: "UPDATE", entityType, entityId: row.id, metadata: { isActive } });
    return row;
  });
}

async function updateLookupRow<T extends { id: string }>(
  entityType: string,
  userId: string,
  update: (tx: Prisma.TransactionClient) => Promise<T>,
) {
  try {
    return await db.$transaction(async (tx) => {
      const row = await update(tx);
      await logAudit(tx, { userId, action: "UPDATE", entityType, entityId: row.id });
      return row;
    });
  } catch (error) {
    return throwFriendlyUniqueError(error);
  }
}

// Guarded hard delete: a lookup row is only removed when nothing references it,
// otherwise we refuse and steer the user to deactivate instead — the app keeps
// historical records pointing at these rows, so a blind delete would either
// FK-violate or orphan data. `countRefs` returns how many records still use it.
async function deleteLookupRow<T extends { id: string }>(
  entityType: string,
  userId: string,
  countRefs: (tx: Prisma.TransactionClient) => Promise<number>,
  del: (tx: Prisma.TransactionClient) => Promise<T>,
) {
  return db.$transaction(async (tx) => {
    const refs = await countRefs(tx);
    if (refs > 0) {
      throw new SettingsServiceError(
        `Can't delete — it's still used by ${refs} record(s). Deactivate it instead to hide it from new entries.`,
      );
    }
    const row = await del(tx);
    await logAudit(tx, { userId, action: "DELETE", entityType, entityId: row.id });
    return row;
  });
}

export async function createCounselingCategory(input: CreateSimpleLookupInput, userId: string) {
  const code = input.code;
  if (!code) throw new SettingsServiceError("Code is required.");
  return createLookupRow("counseling_category", userId, (tx) =>
    tx.counselingCategory.create({
      data: { code, name: input.name, description: input.description || null },
    }),
  );
}

export async function setCounselingCategoryActive(id: string, isActive: boolean, userId: string) {
  return setLookupRowActive("counseling_category", userId, isActive, (tx) =>
    tx.counselingCategory.update({ where: { id }, data: { isActive } }),
  );
}

export async function updateCounselingCategory(id: string, input: UpdateSimpleLookupInput, userId: string) {
  const code = input.code;
  if (!code) throw new SettingsServiceError("Code is required.");
  return updateLookupRow("counseling_category", userId, (tx) =>
    tx.counselingCategory.update({
      where: { id },
      data: { code, name: input.name, description: input.description || null },
    }),
  );
}

export async function createIncidentCategory(input: CreateSimpleLookupInput, userId: string) {
  const code = input.code;
  if (!code) throw new SettingsServiceError("Code is required.");
  return createLookupRow("incident_category", userId, (tx) =>
    tx.incidentCategory.create({ data: { code, name: input.name } }),
  );
}

export async function setIncidentCategoryActive(id: string, isActive: boolean, userId: string) {
  return setLookupRowActive("incident_category", userId, isActive, (tx) =>
    tx.incidentCategory.update({ where: { id }, data: { isActive } }),
  );
}

export async function updateIncidentCategory(id: string, input: UpdateSimpleLookupInput, userId: string) {
  const code = input.code;
  if (!code) throw new SettingsServiceError("Code is required.");
  return updateLookupRow("incident_category", userId, (tx) =>
    tx.incidentCategory.update({ where: { id }, data: { code, name: input.name } }),
  );
}

export async function createBehaviorCategory(input: CreateBehaviorCategoryInput, userId: string) {
  return createLookupRow("behavior_category", userId, (tx) =>
    tx.behaviorCategory.create({
      data: { code: input.code || null, name: input.name, type: input.type },
    }),
  );
}

export async function setBehaviorCategoryActive(id: string, isActive: boolean, userId: string) {
  return setLookupRowActive("behavior_category", userId, isActive, (tx) =>
    tx.behaviorCategory.update({ where: { id }, data: { isActive } }),
  );
}

export async function updateBehaviorCategory(id: string, input: UpdateBehaviorCategoryInput, userId: string) {
  return updateLookupRow("behavior_category", userId, (tx) =>
    tx.behaviorCategory.update({
      where: { id },
      data: { code: input.code || null, name: input.name, type: input.type },
    }),
  );
}

export async function createActionCode(input: CreateSimpleLookupInput, userId: string) {
  return createLookupRow("action_code", userId, (tx) =>
    tx.actionCode.create({ data: { code: input.code || null, name: input.name } }),
  );
}

export async function setActionCodeActive(id: string, isActive: boolean, userId: string) {
  return setLookupRowActive("action_code", userId, isActive, (tx) =>
    tx.actionCode.update({ where: { id }, data: { isActive } }),
  );
}

export async function updateActionCode(id: string, input: UpdateSimpleLookupInput, userId: string) {
  return updateLookupRow("action_code", userId, (tx) =>
    tx.actionCode.update({ where: { id }, data: { code: input.code || null, name: input.name } }),
  );
}

export async function createRiskDimension(input: CreateSimpleLookupInput, userId: string) {
  return createLookupRow("risk_dimension", userId, (tx) =>
    tx.riskDimension.create({
      data: { name: input.name, description: input.description || null },
    }),
  );
}

export async function setRiskDimensionActive(id: string, isActive: boolean, userId: string) {
  return setLookupRowActive("risk_dimension", userId, isActive, (tx) =>
    tx.riskDimension.update({ where: { id }, data: { isActive } }),
  );
}

export async function updateRiskDimension(id: string, input: UpdateSimpleLookupInput, userId: string) {
  return updateLookupRow("risk_dimension", userId, (tx) =>
    tx.riskDimension.update({
      where: { id },
      data: { name: input.name, description: input.description || null },
    }),
  );
}

export async function createDocumentCategory(input: CreateSimpleLookupInput, userId: string) {
  return createLookupRow("document_category", userId, (tx) =>
    tx.documentCategory.create({
      data: { name: input.name, description: input.description || null },
    }),
  );
}

export async function updateDocumentCategory(id: string, input: UpdateSimpleLookupInput, userId: string) {
  return updateLookupRow("document_category", userId, (tx) =>
    tx.documentCategory.update({
      where: { id },
      data: { name: input.name, description: input.description || null },
    }),
  );
}

export async function createSubject(input: CreateSimpleLookupInput, userId: string) {
  return createLookupRow("subject", userId, (tx) =>
    tx.subject.create({ data: { name: input.name } }),
  );
}

export async function setSubjectActive(id: string, isActive: boolean, userId: string) {
  return setLookupRowActive("subject", userId, isActive, (tx) =>
    tx.subject.update({ where: { id }, data: { isActive } }),
  );
}

export async function updateSubject(id: string, input: UpdateSimpleLookupInput, userId: string) {
  return updateLookupRow("subject", userId, (tx) =>
    tx.subject.update({ where: { id }, data: { name: input.name } }),
  );
}

export async function deleteSubject(id: string, userId: string) {
  // Count every teaching plan on this subject, archived ones included — a
  // soft-deleted plan still holds the FK, so deleting the subject would fail.
  return deleteLookupRow(
    "subject",
    userId,
    (tx) => tx.teachingPlan.count({ where: { subjectId: id } }),
    (tx) => tx.subject.delete({ where: { id } }),
  );
}

export async function deleteCounselingCategory(id: string, userId: string) {
  return deleteLookupRow(
    "counseling_category",
    userId,
    (tx) => tx.counselingSession.count({ where: { counselingCategoryId: id } }),
    (tx) => tx.counselingCategory.delete({ where: { id } }),
  );
}

export async function deleteIncidentCategory(id: string, userId: string) {
  return deleteLookupRow(
    "incident_category",
    userId,
    async (tx) =>
      (await tx.incident.count({ where: { incidentCategoryId: id } })) +
      (await tx.incidentCategorySelection.count({ where: { incidentCategoryId: id } })),
    (tx) => tx.incidentCategory.delete({ where: { id } }),
  );
}

export async function deleteBehaviorCategory(id: string, userId: string) {
  return deleteLookupRow(
    "behavior_category",
    userId,
    (tx) => tx.behaviorRecordCategory.count({ where: { behaviorCategoryId: id } }),
    (tx) => tx.behaviorCategory.delete({ where: { id } }),
  );
}

export async function deleteActionCode(id: string, userId: string) {
  return deleteLookupRow(
    "action_code",
    userId,
    (tx) => tx.behaviorRecordAction.count({ where: { actionCodeId: id } }),
    (tx) => tx.actionCode.delete({ where: { id } }),
  );
}

export async function deleteRiskDimension(id: string, userId: string) {
  return deleteLookupRow(
    "risk_dimension",
    userId,
    (tx) => tx.counselingRiskAssessment.count({ where: { riskDimensionId: id } }),
    (tx) => tx.riskDimension.delete({ where: { id } }),
  );
}

export async function deleteDocumentCategory(id: string, userId: string) {
  return deleteLookupRow(
    "document_category",
    userId,
    (tx) => tx.document.count({ where: { documentCategoryId: id } }),
    (tx) => tx.documentCategory.delete({ where: { id } }),
  );
}

// ---------------------------------------------------------------------------
// Academic years, grades, classes, reporting periods
// ---------------------------------------------------------------------------

export async function createAcademicYear(input: CreateAcademicYearInput, userId: string) {
  try {
    return await db.$transaction(async (tx) => {
      const setCurrent = input.isCurrent === "on";
      if (setCurrent) {
        await tx.academicYear.updateMany({ where: { isCurrent: true }, data: { isCurrent: false } });
      }

      const year = await tx.academicYear.create({
        data: {
          name: input.name,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          isCurrent: setCurrent,
        },
      });

      await logAudit(tx, { userId, action: "CREATE", entityType: "academic_year", entityId: year.id });
      return year;
    });
  } catch (error) {
    return throwFriendlyUniqueError(error);
  }
}

export async function updateAcademicYear(id: string, input: UpdateAcademicYearInput, userId: string) {
  try {
    return await db.$transaction(async (tx) => {
      const year = await tx.academicYear.update({
        where: { id },
        data: {
          name: input.name,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
        },
      });

      await logAudit(tx, { userId, action: "UPDATE", entityType: "academic_year", entityId: year.id });
      return year;
    });
  } catch (error) {
    return throwFriendlyUniqueError(error);
  }
}

export async function setCurrentAcademicYear(id: string, userId: string) {
  return db.$transaction(async (tx) => {
    await tx.academicYear.updateMany({ where: { isCurrent: true }, data: { isCurrent: false } });
    const year = await tx.academicYear.update({ where: { id }, data: { isCurrent: true } });

    await logAudit(tx, {
      userId,
      action: "UPDATE",
      entityType: "academic_year",
      entityId: year.id,
      metadata: { isCurrent: true },
    });

    return year;
  });
}

export async function createGrade(input: CreateGradeInput, userId: string) {
  try {
    return await db.$transaction(async (tx) => {
      const grade = await tx.grade.create({ data: { name: input.name, level: input.level } });
      await logAudit(tx, { userId, action: "CREATE", entityType: "grade", entityId: grade.id });
      return grade;
    });
  } catch (error) {
    return throwFriendlyUniqueError(error);
  }
}

export async function updateGrade(id: string, input: UpdateGradeInput, userId: string) {
  try {
    return await db.$transaction(async (tx) => {
      const grade = await tx.grade.update({ where: { id }, data: { name: input.name, level: input.level } });
      await logAudit(tx, { userId, action: "UPDATE", entityType: "grade", entityId: grade.id });
      return grade;
    });
  } catch (error) {
    return throwFriendlyUniqueError(error);
  }
}

export async function createClass(input: CreateClassInput, userId: string) {
  try {
    return await db.$transaction(async (tx) => {
      const cls = await tx.class.create({
        data: {
          name: input.name,
          academicYearId: input.academicYearId,
          gradeId: input.gradeId,
          homeroomTeacher: input.homeroomTeacher || null,
        },
      });
      await logAudit(tx, { userId, action: "CREATE", entityType: "class", entityId: cls.id });
      return cls;
    });
  } catch (error) {
    return throwFriendlyUniqueError(error);
  }
}

export async function updateClass(id: string, input: UpdateClassInput, userId: string) {
  try {
    return await db.$transaction(async (tx) => {
      const cls = await tx.class.update({
        where: { id },
        data: {
          name: input.name,
          academicYearId: input.academicYearId,
          gradeId: input.gradeId,
          homeroomTeacher: input.homeroomTeacher || null,
        },
      });
      await logAudit(tx, { userId, action: "UPDATE", entityType: "class", entityId: cls.id });
      return cls;
    });
  } catch (error) {
    return throwFriendlyUniqueError(error);
  }
}

export async function createReportingPeriod(input: CreateReportingPeriodInput, userId: string) {
  return db.$transaction(async (tx) => {
    const period = await tx.reportingPeriod.create({
      data: {
        academicYearId: input.academicYearId,
        name: input.name,
        periodType: input.periodType,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
      },
    });
    await logAudit(tx, { userId, action: "CREATE", entityType: "reporting_period", entityId: period.id });
    return period;
  });
}

export async function updateReportingPeriod(id: string, input: UpdateReportingPeriodInput, userId: string) {
  return db.$transaction(async (tx) => {
    const period = await tx.reportingPeriod.update({
      where: { id },
      data: {
        academicYearId: input.academicYearId,
        name: input.name,
        periodType: input.periodType,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
      },
    });
    await logAudit(tx, { userId, action: "UPDATE", entityType: "reporting_period", entityId: period.id });
    return period;
  });
}

export async function deleteAcademicYear(id: string, userId: string) {
  return deleteLookupRow(
    "academic_year",
    userId,
    async (tx) =>
      (await tx.class.count({ where: { academicYearId: id } })) +
      (await tx.studentEnrollment.count({ where: { academicYearId: id } })) +
      (await tx.incident.count({ where: { academicYearId: id } })) +
      (await tx.behaviorRecord.count({ where: { academicYearId: id } })) +
      (await tx.reportingPeriod.count({ where: { academicYearId: id } })) +
      (await tx.teachingPlan.count({ where: { academicYearId: id } })),
    (tx) => tx.academicYear.delete({ where: { id } }),
  );
}

export async function deleteGrade(id: string, userId: string) {
  return deleteLookupRow(
    "grade",
    userId,
    async (tx) =>
      (await tx.class.count({ where: { gradeId: id } })) +
      (await tx.studentEnrollment.count({ where: { gradeId: id } })),
    (tx) => tx.grade.delete({ where: { id } }),
  );
}

export async function deleteClass(id: string, userId: string) {
  return deleteLookupRow(
    "class",
    userId,
    async (tx) =>
      (await tx.studentEnrollment.count({ where: { classId: id } })) +
      (await tx.teachingPlan.count({ where: { classId: id } })),
    (tx) => tx.class.delete({ where: { id } }),
  );
}

export async function deleteReportingPeriod(id: string, userId: string) {
  return deleteLookupRow(
    "reporting_period",
    userId,
    (tx) => tx.behaviorRecord.count({ where: { reportingPeriodId: id } }),
    (tx) => tx.reportingPeriod.delete({ where: { id } }),
  );
}

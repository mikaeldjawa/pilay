import { z } from "zod";

export const BEHAVIOR_TYPES = ["NEGATIVE", "POSITIVE"] as const;
export const REPORTING_PERIOD_TYPES = ["MONTHLY", "TRI_MONTHLY", "SEMESTER", "YEAR"] as const;

export const createSimpleLookupSchema = z.object({
  code: z.string().optional().or(z.literal("")),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().or(z.literal("")),
});
export type CreateSimpleLookupInput = z.infer<typeof createSimpleLookupSchema>;

// Editing a lookup row touches the same fields as creating one — reuse the
// shape rather than re-declare it.
export const updateSimpleLookupSchema = createSimpleLookupSchema;
export type UpdateSimpleLookupInput = CreateSimpleLookupInput;

export const createBehaviorCategorySchema = z.object({
  code: z.string().optional().or(z.literal("")),
  name: z.string().min(1, "Name is required"),
  type: z.enum(BEHAVIOR_TYPES),
});
export type CreateBehaviorCategoryInput = z.infer<typeof createBehaviorCategorySchema>;

export const updateBehaviorCategorySchema = createBehaviorCategorySchema;
export type UpdateBehaviorCategoryInput = CreateBehaviorCategoryInput;

export const createAcademicYearSchema = z.object({
  name: z.string().min(1, "Name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  isCurrent: z.union([z.literal("on"), z.literal("")]).optional(),
});
export type CreateAcademicYearInput = z.infer<typeof createAcademicYearSchema>;

// Editing doesn't touch isCurrent — that's handled by the dedicated "Set
// current" action so the two concerns (rename/redate vs. which year is
// active) never get tangled in one submit.
export const updateAcademicYearSchema = z.object({
  name: z.string().min(1, "Name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});
export type UpdateAcademicYearInput = z.infer<typeof updateAcademicYearSchema>;

export const createGradeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  level: z.coerce.number().int(),
});
export type CreateGradeInput = z.infer<typeof createGradeSchema>;

export const updateGradeSchema = createGradeSchema;
export type UpdateGradeInput = CreateGradeInput;

export const createClassSchema = z.object({
  name: z.string().min(1, "Name is required"),
  academicYearId: z.string().min(1, "Academic year is required"),
  gradeId: z.string().min(1, "Grade is required"),
  homeroomTeacher: z.string().optional().or(z.literal("")),
});
export type CreateClassInput = z.infer<typeof createClassSchema>;

export const updateClassSchema = createClassSchema;
export type UpdateClassInput = CreateClassInput;

export const createReportingPeriodSchema = z.object({
  academicYearId: z.string().min(1, "Academic year is required"),
  name: z.string().min(1, "Name is required"),
  periodType: z.enum(REPORTING_PERIOD_TYPES),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});
export type CreateReportingPeriodInput = z.infer<typeof createReportingPeriodSchema>;

export const updateReportingPeriodSchema = createReportingPeriodSchema;
export type UpdateReportingPeriodInput = CreateReportingPeriodInput;

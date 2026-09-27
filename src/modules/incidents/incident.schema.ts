import { z } from "zod";

export const INVOLVEMENT_TYPES = [
  "PRIMARY",
  "INVOLVED",
  "VICTIM",
  "RESPONDENT",
  "WITNESS",
  "OTHER",
] as const;

export const INCIDENT_STATUSES = [
  "NEW",
  "UNDER_INVESTIGATION",
  "SUPPORT_PLAN_ACTIVE",
  "MONITORING",
  "RESOLVED",
  "CLOSED",
] as const;

const jsonArray = <T extends z.ZodTypeAny>(schema: T) =>
  z
    .string()
    .optional()
    .transform((value, ctx): z.infer<T>[] => {
      if (!value) return [];
      try {
        const parsed = JSON.parse(value);
        const result = z.array(schema).safeParse(parsed);
        if (!result.success) {
          ctx.addIssue({ code: "custom", message: "Invalid list data." });
          return z.NEVER;
        }
        return result.data;
      } catch {
        ctx.addIssue({ code: "custom", message: "Invalid list data." });
        return z.NEVER;
      }
    });

const majorIncidentBaseSchema = z.object({
  primaryStudentId: z.string().min(1, "Primary student is required"),
  incidentCategoryId: z.string().min(1, "Primary category is required"),
  additionalCategoryIds: jsonArray(z.string()),
  incidentDate: z.string().min(1, "Incident date is required"),
  incidentTime: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  counselorOrAdminCalledAt: z.string().optional().or(z.literal("")),

  participants: jsonArray(
    z.object({
      studentId: z.string().min(1),
      involvementType: z.enum(INVOLVEMENT_TYPES),
      notes: z.string().optional(),
    }),
  ),
  witnesses: jsonArray(
    z.object({
      name: z.string().min(1),
      role: z.string().optional(),
      notes: z.string().optional(),
    }),
  ),

  antecedent: z.string().min(1, "Antecedent is required"),
  behavior: z.string().min(1, "Behavior is required"),
  impact: z.string().min(1, "Impact is required"),
  additionalInformation: z.string().optional().or(z.literal("")),

  studentEscortedToOffice: z.union([z.literal("on"), z.literal("")]).optional(),
  classroomEvacuated: z.union([z.literal("on"), z.literal("")]).optional(),
  firstAidOrNurseRequested: z.union([z.literal("on"), z.literal("")]).optional(),
  onsiteDeescalationByCounselor: z.union([z.literal("on"), z.literal("")]).optional(),
  additionalAction: z.string().optional().or(z.literal("")),

  parentContactRequired: z.union([z.literal("on"), z.literal("")]).optional(),
  leadershipNotified: z.union([z.literal("on"), z.literal("")]).optional(),
  supportPlan: z.string().optional().or(z.literal("")),

  reportingStaffSignerName: z.string().optional().or(z.literal("")),
  counselorSignerName: z.string().optional().or(z.literal("")),
  leadershipSignerName: z.string().optional().or(z.literal("")),

  followUpTitle: z.string().optional().or(z.literal("")),
  followUpDueDate: z.string().optional().or(z.literal("")),

  escalateBehaviorRecordIds: z
    .string()
    .optional()
    .transform((value) => (value ? value.split(",").map((s) => s.trim()).filter(Boolean) : [])),
});

function withCommonRefinements<T extends typeof majorIncidentBaseSchema>(schema: T) {
  return schema
    .refine((data) => data.participants.length > 0, {
      message: "At least one participant is required for a major incident.",
      path: ["participants"],
    })
    .refine((data) => data.additionalCategoryIds.length > 0 || data.incidentCategoryId, {
      message: "At least one incident category is required.",
      path: ["incidentCategoryId"],
    });
}

export const createMajorIncidentSchema = withCommonRefinements(majorIncidentBaseSchema);
export type CreateMajorIncidentInput = z.infer<typeof createMajorIncidentSchema>;

// Same shape plus a case-status field, which only makes sense once an
// incident already exists (new incidents always start at NEW).
export const updateMajorIncidentSchema = withCommonRefinements(
  majorIncidentBaseSchema.extend({ status: z.enum(INCIDENT_STATUSES) }),
);
export type UpdateMajorIncidentInput = z.infer<typeof updateMajorIncidentSchema>;

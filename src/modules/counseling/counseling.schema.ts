import { z } from "zod";

export const RISK_LEVELS = ["LOW", "MODERATE", "HIGH", "CRITICAL"] as const;
export const CREDIBILITY_RATINGS = ["LOW", "MODERATE", "HIGH"] as const;
export const SESSION_STATUSES = ["OPEN", "FOLLOW_UP", "COMPLETED", "CLOSED"] as const;

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
          ctx.addIssue({ code: "custom", message: "Invalid repeating section data." });
          return z.NEVER;
        }
        return result.data;
      } catch {
        ctx.addIssue({ code: "custom", message: "Invalid repeating section data." });
        return z.NEVER;
      }
    });

const titleBodySchema = z.object({ title: z.string().min(1), body: z.string().min(1) });

const counselingSessionBaseSchema = z.object({
    studentId: z.string().min(1, "Attending student is required"),
    subjectStudentId: z.string().optional().or(z.literal("")),
    counselingCategoryId: z.string().min(1, "Category is required"),
    sessionDate: z.string().min(1, "Session date is required"),
    startTime: z.string().optional().or(z.literal("")),
    endTime: z.string().optional().or(z.literal("")),
    purpose: z.string().min(1, "Purpose is required"),
    riskLevel: z.enum(RISK_LEVELS),
    status: z.enum(SESSION_STATUSES),
    followUpRequired: z.union([z.literal("on"), z.literal("")]).optional(),
    followUpTitle: z.string().optional().or(z.literal("")),
    followUpDueDate: z.string().optional().or(z.literal("")),

    presentationEngagement: z.string().optional().or(z.literal("")),
    emotionalAffect: z.string().optional().or(z.literal("")),
    credibilityObjectivity: z.string().optional().or(z.literal("")),
    credibilityRating: z.union([z.enum(CREDIBILITY_RATINGS), z.literal("")]).optional(),
    actionTaken: z.string().optional().or(z.literal("")),
    followUpNotes: z.string().optional().or(z.literal("")),
    summaryContext: z.string().optional().or(z.literal("")),
    summaryPeerDynamic: z.string().optional().or(z.literal("")),
    summaryConclusion: z.string().optional().or(z.literal("")),

    keyTakeaways: jsonArray(titleBodySchema),
    timelineEvents: jsonArray(
      z.object({
        phase: z.enum(["BEFORE", "DURING", "AFTER", "CUSTOM"]),
        title: z.string().optional(),
        body: z.string().min(1),
      }),
    ),
    peerPerceptions: jsonArray(titleBodySchema),
    groupObservations: jsonArray(titleBodySchema),
    objectiveFindings: jsonArray(titleBodySchema),
    riskAssessments: jsonArray(
      z.object({
        riskDimensionId: z.string().min(1),
        subjectLabel: z.string().optional(),
        riskLevel: z.enum(RISK_LEVELS),
        justification: z.string().min(1),
      }),
    ),
    actionItems: jsonArray(
      z.object({ title: z.string().min(1), body: z.string().min(1), owner: z.string().optional() }),
    ),
});

export const createCounselingSessionSchema = counselingSessionBaseSchema.superRefine((data, ctx) => {
  if (data.followUpRequired === "on" && (!data.followUpTitle || !data.followUpDueDate)) {
    ctx.addIssue({
      code: "custom",
      message: "Follow-up title and due date are required when follow-up is marked required.",
      path: ["followUpTitle"],
    });
  }
});

export type CreateCounselingSessionInput = z.infer<typeof createCounselingSessionSchema>;

// Same shape, without the strict follow-up refine: editing an already-linked
// follow-up happens on the Follow-ups page, not here — see
// counseling.service.ts's updateCounselingSession for the "only create if
// none exists yet" rule.
export const updateCounselingSessionSchema = counselingSessionBaseSchema;
export type UpdateCounselingSessionInput = z.infer<typeof updateCounselingSessionSchema>;

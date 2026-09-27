import { z } from "zod";

export const SEMESTERS = ["1", "2"] as const;

// Serialize repeating lesson rows to a hidden JSON input, then parse+validate
// here — same pattern as counseling's repeating sections.
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
          ctx.addIssue({ code: "custom", message: "Invalid lesson data." });
          return z.NEVER;
        }
        return result.data;
      } catch {
        ctx.addIssue({ code: "custom", message: "Invalid lesson data." });
        return z.NEVER;
      }
    });

export const createTeachingPlanSchema = z.object({
  academicYearId: z.string().min(1, "Academic year is required"),
  semester: z.enum(SEMESTERS),
  classId: z.string().min(1, "Class is required"),
  subjectId: z.string().min(1, "Subject is required"),
  teacherId: z.string().min(1, "Teacher is required"),
  title: z.string().optional().or(z.literal("")),
  weekCount: z.coerce
    .number()
    .int()
    .min(1, "At least 1 week")
    .max(52, "At most 52 weeks"),
});
export type CreateTeachingPlanInput = z.infer<typeof createTeachingPlanSchema>;

// The five identity fields are immutable after creation so the uniqueness
// constraint can't be side-stepped by an edit — only the descriptive metadata
// is editable here.
export const updateTeachingPlanSchema = z.object({
  title: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});
export type UpdateTeachingPlanInput = z.infer<typeof updateTeachingPlanSchema>;

const lessonSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  content: z.string().optional(),
});

export const updateWeekSchema = z.object({
  topic: z.string().optional().or(z.literal("")),
  learningObjective: z.string().optional().or(z.literal("")),
  detailPlan: z.string().optional().or(z.literal("")),
  lessons: jsonArray(lessonSchema),
});
export type UpdateWeekInput = z.infer<typeof updateWeekSchema>;

export const attachMaterialSchema = z.object({
  title: z.string().optional().or(z.literal("")),
});
export type AttachMaterialInput = z.infer<typeof attachMaterialSchema>;

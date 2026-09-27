import { z } from "zod";

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

const behaviorRecordBaseSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  behaviorCategoryIds: jsonArray(z.string()),
  behaviorCategoryOther: z.string().optional().or(z.literal("")),
  recordDate: z.string().min(1, "Date is required"),
  recordTime: z.string().optional().or(z.literal("")),
  classroomReference: z.string().optional().or(z.literal("")),
  actionCodeIds: jsonArray(z.string()),
  actionCodeOther: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});

function withBehaviorRefinement<T extends typeof behaviorRecordBaseSchema>(schema: T) {
  return schema.refine(
    (data) => data.behaviorCategoryIds.length > 0 || !!data.behaviorCategoryOther,
    { message: "At least one behavior code is required", path: ["behaviorCategoryIds"] },
  );
}

export const createBehaviorRecordSchema = withBehaviorRefinement(behaviorRecordBaseSchema);
export type CreateBehaviorRecordInput = z.infer<typeof createBehaviorRecordSchema>;

// Same shape as create — editing doesn't change which student the record
// belongs to in practice, but the field stays present so the same form/schema
// can drive both flows.
export const updateBehaviorRecordSchema = withBehaviorRefinement(behaviorRecordBaseSchema);
export type UpdateBehaviorRecordInput = z.infer<typeof updateBehaviorRecordSchema>;

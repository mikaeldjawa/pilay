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

export const createJournalEntrySchema = z.object({
  entryDate: z.string().min(1, "Entry date is required"),
  entryTime: z.string().optional().or(z.literal("")),
  title: z.string().min(1, "Title is required"),
  note: z.string().min(1, "Note is required"),
  sessionIds: jsonArray(z.string()),
  incidentIds: jsonArray(z.string()),
  behaviorRecordIds: jsonArray(z.string()),
});

export type CreateJournalEntryInput = z.infer<typeof createJournalEntrySchema>;

export const updateJournalEntrySchema = createJournalEntrySchema;
export type UpdateJournalEntryInput = z.infer<typeof updateJournalEntrySchema>;

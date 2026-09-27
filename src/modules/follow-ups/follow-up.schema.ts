import { z } from "zod";

export const FOLLOW_UP_PRIORITIES = ["LOW", "NORMAL", "HIGH", "CRITICAL"] as const;

export const createFollowUpSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().or(z.literal("")),
  priority: z.enum(FOLLOW_UP_PRIORITIES),
  dueDate: z.string().min(1, "Due date is required"),
});

export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>;

export const completeFollowUpSchema = z.object({
  completedNotes: z.string().optional().or(z.literal("")),
});

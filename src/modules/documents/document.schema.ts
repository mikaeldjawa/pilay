import { z } from "zod";

export const uploadDocumentSchema = z.object({
  studentId: z.string().optional().or(z.literal("")),
  documentCategoryId: z.string().min(1, "Category is required"),
  title: z.string().min(1, "Title is required"),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;

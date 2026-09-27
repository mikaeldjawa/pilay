import { z } from "zod";

// Shape of a row after it's been extracted from the uploaded workbook —
// column headers already resolved to these fixed keys (case-insensitive
// header match happens in student-import.service.ts's parseStudentImportFile).
export const parsedImportRowSchema = z.object({
  rowNumber: z.number(),
  studentId: z.string().trim().min(1, "Student ID is required"),
  name: z.string().trim().min(1, "Name is required"),
  className: z.string().trim().min(1, "Class is required"),
  gender: z.string().trim().optional(),
  academicYearName: z.string().trim().min(1, "Academic Year is required"),
});

export type ParsedImportRow = z.infer<typeof parsedImportRowSchema>;

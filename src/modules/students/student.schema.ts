import { z } from "zod";

export const STUDENT_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "GRADUATED",
  "TRANSFERRED",
  "WITHDRAWN",
] as const;

export const createStudentSchema = z.object({
  studentId: z.string().trim().min(1, "Student ID is required"),
  firstName: z.string().trim().min(1, "First name is required"),
  middleName: z.string().trim().optional().or(z.literal("")),
  lastName: z.string().trim().optional().or(z.literal("")),
  dateOfBirth: z.string().trim().optional().or(z.literal("")),
  gender: z.string().trim().optional().or(z.literal("")),
  gradeId: z.string().min(1, "Grade is required"),
  classId: z.string().min(1, "Class is required"),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;

export const updateStudentSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  middleName: z.string().trim().optional().or(z.literal("")),
  lastName: z.string().trim().optional().or(z.literal("")),
  dateOfBirth: z.string().trim().optional().or(z.literal("")),
  gender: z.string().trim().optional().or(z.literal("")),
  status: z.enum(STUDENT_STATUSES),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

import { z } from "zod";

export const CONTACT_METHODS = ["PHONE", "EMAIL", "MEETING", "MESSAGING", "OTHER"] as const;

export const createGuardianSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  fullName: z.string().min(1, "Name is required"),
  relationship: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  isPrimaryContact: z.union([z.literal("on"), z.literal("")]).optional(),
  isEmergencyContact: z.union([z.literal("on"), z.literal("")]).optional(),
});

export type CreateGuardianInput = z.infer<typeof createGuardianSchema>;

export const updateGuardianSchema = createGuardianSchema;
export type UpdateGuardianInput = z.infer<typeof updateGuardianSchema>;

export const createParentContactSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  guardianId: z.string().min(1, "Guardian is required"),
  method: z.enum(CONTACT_METHODS),
  contactDate: z.string().min(1, "Date is required"),
  reason: z.string().min(1, "Reason is required"),
  summary: z.string().min(1, "Summary is required"),
  outcome: z.string().optional().or(z.literal("")),
  followUpRequired: z.union([z.literal("on"), z.literal("")]).optional(),
  followUpTitle: z.string().optional().or(z.literal("")),
  followUpDueDate: z.string().optional().or(z.literal("")),
  relatedIncidentId: z.string().optional().or(z.literal("")),
  relatedSessionId: z.string().optional().or(z.literal("")),
});

export type CreateParentContactInput = z.infer<typeof createParentContactSchema>;

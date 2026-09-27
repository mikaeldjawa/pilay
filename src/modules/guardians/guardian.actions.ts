"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  createGuardianForStudent,
  createParentContact,
  updateGuardian,
  archiveGuardian,
  archiveParentContact,
  GuardianServiceError,
} from "@/modules/guardians/guardian.service";
import {
  createGuardianSchema,
  createParentContactSchema,
  updateGuardianSchema,
} from "@/modules/guardians/guardian.schema";
import type { ActionState } from "@/modules/students/student.actions";
import { withSuccessFlash } from "@/lib/flash";

export async function createGuardianAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = createGuardianSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await createGuardianForStudent(parsed.data, session.user.id);
  revalidatePath(`/students/${parsed.data.studentId}`);
  redirect(withSuccessFlash(`/students/${parsed.data.studentId}`, "Guardian added"));
}

export async function updateGuardianAction(
  guardianId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = updateGuardianSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await updateGuardian(guardianId, parsed.data, session.user.id);
  revalidatePath(`/students/${parsed.data.studentId}`);
  redirect(withSuccessFlash(`/students/${parsed.data.studentId}`, "Guardian updated"));
}

export async function createParentContactAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = createParentContactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await createParentContact(parsed.data, session.user.id);
  } catch (error) {
    if (error instanceof GuardianServiceError) return { error: error.message };
    throw error;
  }
  revalidatePath(`/students/${parsed.data.studentId}`);
  revalidatePath("/follow-ups");

  if (parsed.data.relatedIncidentId) {
    revalidatePath(`/incidents/${parsed.data.relatedIncidentId}`);
    redirect(withSuccessFlash(`/incidents/${parsed.data.relatedIncidentId}`, "Parent contact logged"));
  }
  if (parsed.data.relatedSessionId) {
    revalidatePath(`/counseling/${parsed.data.relatedSessionId}`);
    redirect(withSuccessFlash(`/counseling/${parsed.data.relatedSessionId}`, "Parent contact logged"));
  }
  redirect(withSuccessFlash(`/students/${parsed.data.studentId}`, "Parent contact logged"));
}

export async function archiveGuardianAction(guardianId: string, studentId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await archiveGuardian(guardianId, session.user.id);
  revalidatePath(`/students/${studentId}`);
}

export async function archiveParentContactAction(
  contactId: string,
  studentId: string,
  additionalRevalidatePath?: string,
) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await archiveParentContact(contactId, session.user.id);
  revalidatePath(`/students/${studentId}`);
  if (additionalRevalidatePath) revalidatePath(additionalRevalidatePath);
}

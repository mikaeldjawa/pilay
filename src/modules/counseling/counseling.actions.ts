"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  createCounselingSession,
  updateCounselingSession,
  archiveCounselingSession,
  CounselingServiceError,
} from "@/modules/counseling/counseling.service";
import {
  createCounselingSessionSchema,
  updateCounselingSessionSchema,
} from "@/modules/counseling/counseling.schema";
import type { ActionState } from "@/modules/students/student.actions";
import { withSuccessFlash } from "@/lib/flash";

export async function createCounselingSessionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = createCounselingSessionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  let sessionId: string;
  try {
    const created = await createCounselingSession(parsed.data, session.user.id);
    sessionId = created.id;
  } catch (error) {
    if (error instanceof CounselingServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/counseling");
  revalidatePath(`/students/${parsed.data.studentId}`);
  redirect(withSuccessFlash(`/counseling/${sessionId}`, "Counseling session created"));
}

export async function updateCounselingSessionAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = updateCounselingSessionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await updateCounselingSession(id, parsed.data, session.user.id);
  } catch (error) {
    if (error instanceof CounselingServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/counseling");
  revalidatePath(`/counseling/${id}`);
  revalidatePath(`/students/${parsed.data.studentId}`);
  redirect(withSuccessFlash(`/counseling/${id}`, "Counseling session updated"));
}

export async function archiveCounselingSessionAction(id: string, studentId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await archiveCounselingSession(id, session.user.id);
  revalidatePath("/counseling");
  revalidatePath(`/counseling/${id}`);
  revalidatePath(`/students/${studentId}`);
}

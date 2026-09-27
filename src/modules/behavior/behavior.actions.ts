"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  createBehaviorRecord,
  updateBehaviorRecord,
  archiveBehaviorRecord,
  BehaviorServiceError,
  type ChronicPattern,
} from "@/modules/behavior/behavior.service";
import {
  createBehaviorRecordSchema,
  updateBehaviorRecordSchema,
} from "@/modules/behavior/behavior.schema";
import type { ActionState } from "@/modules/students/student.actions";
import { withSuccessFlash } from "@/lib/flash";

export type BehaviorActionState =
  | { error: string; pattern?: undefined }
  | { error?: undefined; pattern: ChronicPattern | null }
  | undefined;

export async function createBehaviorRecordAction(
  _prevState: BehaviorActionState,
  formData: FormData,
): Promise<BehaviorActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = createBehaviorRecordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const { pattern } = await createBehaviorRecord(parsed.data, session.user.id);
    revalidatePath("/incidents");
    revalidatePath(`/students/${parsed.data.studentId}`);
    return { pattern: pattern?.isChronic ? pattern : null };
  } catch (error) {
    if (error instanceof BehaviorServiceError) {
      return { error: error.message };
    }
    throw error;
  }
}

export async function updateBehaviorRecordAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = updateBehaviorRecordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await updateBehaviorRecord(id, parsed.data, session.user.id);
  } catch (error) {
    if (error instanceof BehaviorServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/incidents");
  revalidatePath(`/students/${parsed.data.studentId}`);
  redirect(withSuccessFlash(`/students/${parsed.data.studentId}`, "Behavior record updated"));
}

export async function archiveBehaviorRecordAction(recordId: string, studentId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await archiveBehaviorRecord(recordId, session.user.id);
  revalidatePath("/incidents");
  revalidatePath(`/students/${studentId}`);
}

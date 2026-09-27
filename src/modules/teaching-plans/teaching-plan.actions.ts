"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  createTeachingPlan,
  updateTeachingPlan,
  archiveTeachingPlan,
  updateWeek,
  attachMaterial,
  removeMaterial,
  TeachingPlanServiceError,
} from "@/modules/teaching-plans/teaching-plan.service";
import {
  createTeachingPlanSchema,
  updateTeachingPlanSchema,
  updateWeekSchema,
  attachMaterialSchema,
} from "@/modules/teaching-plans/teaching-plan.schema";
import { DocumentServiceError } from "@/modules/documents/document.service";
import type { ActionState } from "@/modules/students/student.actions";
import { withSuccessFlash } from "@/lib/flash";

export async function createTeachingPlanAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = createTeachingPlanSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  let planId: string;
  try {
    const created = await createTeachingPlan(parsed.data, session.user.id);
    planId = created.id;
  } catch (error) {
    if (error instanceof TeachingPlanServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/teaching-plans");
  redirect(withSuccessFlash(`/teaching-plans/${planId}`, "Teaching plan created"));
}

export async function updateTeachingPlanAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = updateTeachingPlanSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await updateTeachingPlan(id, parsed.data, session.user.id);
  } catch (error) {
    if (error instanceof TeachingPlanServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/teaching-plans");
  revalidatePath(`/teaching-plans/${id}`);
  redirect(withSuccessFlash(`/teaching-plans/${id}`, "Teaching plan updated"));
}

export async function archiveTeachingPlanAction(id: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await archiveTeachingPlan(id, session.user.id);
  revalidatePath("/teaching-plans");
  revalidatePath(`/teaching-plans/${id}`);
}

export async function updateWeekAction(
  planId: string,
  weekId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = updateWeekSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await updateWeek(weekId, parsed.data, session.user.id);

  revalidatePath(`/teaching-plans/${planId}`);
  revalidatePath(`/teaching-plans/${planId}/weeks/${weekId}`);
  redirect(withSuccessFlash(`/teaching-plans/${planId}`, "Week saved"));
}

export async function attachMaterialAction(
  planId: string,
  weekId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = attachMaterialSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "A file is required." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    await attachMaterial(
      weekId,
      parsed.data.title ?? "",
      { name: file.name, type: file.type, size: file.size, buffer },
      session.user.id,
    );
  } catch (error) {
    if (error instanceof DocumentServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath(`/teaching-plans/${planId}`);
  revalidatePath(`/teaching-plans/${planId}/weeks/${weekId}`);
  return {};
}

export async function removeMaterialAction(
  planId: string,
  weekId: string,
  documentId: string,
) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await removeMaterial(documentId, session.user.id);
  revalidatePath(`/teaching-plans/${planId}`);
  revalidatePath(`/teaching-plans/${planId}/weeks/${weekId}`);
}

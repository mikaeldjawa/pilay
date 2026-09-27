"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  createMajorIncident,
  updateMajorIncident,
  archiveIncident,
  IncidentServiceError,
} from "@/modules/incidents/incident.service";
import {
  createMajorIncidentSchema,
  updateMajorIncidentSchema,
} from "@/modules/incidents/incident.schema";
import type { ActionState } from "@/modules/students/student.actions";
import { withSuccessFlash } from "@/lib/flash";

export async function createMajorIncidentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = createMajorIncidentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  let incidentId: string;
  try {
    const incident = await createMajorIncident(parsed.data, session.user.id);
    incidentId = incident.id;
  } catch (error) {
    if (error instanceof IncidentServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/incidents");
  revalidatePath(`/students/${parsed.data.primaryStudentId}`);
  redirect(withSuccessFlash(`/incidents/${incidentId}`, "Incident created"));
}

export async function updateMajorIncidentAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = updateMajorIncidentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await updateMajorIncident(id, parsed.data, session.user.id);
  } catch (error) {
    if (error instanceof IncidentServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/incidents");
  revalidatePath(`/incidents/${id}`);
  revalidatePath(`/students/${parsed.data.primaryStudentId}`);
  redirect(withSuccessFlash(`/incidents/${id}`, "Incident updated"));
}

export async function archiveIncidentAction(id: string, primaryStudentId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await archiveIncident(id, session.user.id);
  revalidatePath("/incidents");
  revalidatePath(`/incidents/${id}`);
  revalidatePath(`/students/${primaryStudentId}`);
}

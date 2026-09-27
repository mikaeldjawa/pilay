"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createFollowUp, completeFollowUp } from "@/modules/follow-ups/follow-up.service";
import { createFollowUpSchema } from "@/modules/follow-ups/follow-up.schema";
import type { ActionState } from "@/modules/students/student.actions";
import { withSuccessFlash } from "@/lib/flash";

export async function createFollowUpAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = createFollowUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await createFollowUp(parsed.data, session.user.id);
  revalidatePath("/follow-ups");
  revalidatePath(`/students/${parsed.data.studentId}`);
  redirect(withSuccessFlash("/follow-ups", "Follow-up created"));
}

export async function completeFollowUpAction(id: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await completeFollowUp(id, session.user.id);
  revalidatePath("/follow-ups");
}

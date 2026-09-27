"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  createJournalEntry,
  updateJournalEntry,
  archiveJournalEntry,
  JournalServiceError,
} from "@/modules/journal/journal.service";
import {
  createJournalEntrySchema,
  updateJournalEntrySchema,
} from "@/modules/journal/journal.schema";
import type { ActionState } from "@/modules/students/student.actions";
import { withSuccessFlash } from "@/lib/flash";

export async function createJournalEntryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = createJournalEntrySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await createJournalEntry(parsed.data, session.user.id);
  revalidatePath("/journal");
  redirect(withSuccessFlash("/journal", "Journal entry added"));
}

export async function updateJournalEntryAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = updateJournalEntrySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await updateJournalEntry(id, parsed.data, session.user.id);
  } catch (error) {
    if (error instanceof JournalServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/journal");
  redirect(withSuccessFlash("/journal", "Journal entry updated"));
}

export async function archiveJournalEntryAction(id: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await archiveJournalEntry(id, session.user.id);
  revalidatePath("/journal");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { uploadDocument, DocumentServiceError } from "@/modules/documents/document.service";
import { uploadDocumentSchema } from "@/modules/documents/document.schema";
import type { ActionState } from "@/modules/students/student.actions";

export async function uploadDocumentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = uploadDocumentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "A file is required." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    await uploadDocument(
      parsed.data,
      { name: file.name, type: file.type, size: file.size, buffer },
      session.user.id,
    );
  } catch (error) {
    if (error instanceof DocumentServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/documents");
  return {};
}

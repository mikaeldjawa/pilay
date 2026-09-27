"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  createStudent,
  updateStudent,
  archiveStudent,
  restoreStudent,
  StudentServiceError,
} from "@/modules/students/student.service";
import { createStudentSchema, updateStudentSchema } from "@/modules/students/student.schema";
import {
  parseStudentImportFile,
  importStudents,
  type ImportRowResult,
} from "@/modules/students/student-import.service";
import { uploadDocument, DocumentServiceError } from "@/modules/documents/document.service";
import { withSuccessFlash } from "@/lib/flash";

export type ActionState = { error?: string } | undefined;

export type ImportStudentsState =
  | {
      error?: string;
      summary?: { total: number; created: number; failed: number };
      rowResults?: ImportRowResult[];
    }
  | undefined;

export async function createStudentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = createStudentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  let studentId: string;
  try {
    const student = await createStudent(parsed.data);
    studentId = student.id;
  } catch (error) {
    if (error instanceof StudentServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/students");
  redirect(withSuccessFlash(`/students/${studentId}`, "Student created"));
}

export async function updateStudentAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = updateStudentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await updateStudent(id, parsed.data);
  } catch (error) {
    if (error instanceof StudentServiceError) {
      return { error: error.message };
    }
    throw error;
  }

  revalidatePath("/students");
  revalidatePath(`/students/${id}`);
  redirect(withSuccessFlash(`/students/${id}`, "Student updated"));
}

export async function archiveStudentAction(id: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await archiveStudent(id, session.user.id);
  revalidatePath("/students");
  revalidatePath(`/students/${id}`);
}

export async function restoreStudentAction(id: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await restoreStudent(id);
  revalidatePath("/students");
  revalidatePath(`/students/${id}`);
}

export async function importStudentsAction(
  _prevState: ImportStudentsState,
  formData: FormData,
): Promise<ImportStudentsState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "A .xlsx file is required." };
  }
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return { error: "Only .xlsx files are supported." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const { rows, parseErrors } = await parseStudentImportFile(buffer);
  if (rows.length === 0 && parseErrors.length > 0) {
    return { error: parseErrors[0].message };
  }

  const { total, created, failed, results } = await importStudents(rows);
  const rowResults: ImportRowResult[] = [
    ...parseErrors.map((e) => ({ row: e.row, status: "error" as const, message: e.message })),
    ...results,
  ].sort((a, b) => a.row - b.row);

  const rosterCategory = await db.documentCategory.findFirst({ where: { name: "Student Roster" } });
  if (rosterCategory) {
    try {
      await uploadDocument(
        {
          studentId: "",
          documentCategoryId: rosterCategory.id,
          title: `Student Import — ${new Date().toLocaleDateString()}`,
        },
        { name: file.name, type: file.type, size: file.size, buffer },
        session.user.id,
      );
      revalidatePath("/documents");
    } catch (error) {
      if (error instanceof DocumentServiceError) {
        return { error: error.message };
      }
      throw error;
    }
  }

  revalidatePath("/students");

  return {
    summary: { total: total + parseErrors.length, created, failed: failed + parseErrors.length },
    rowResults,
  };
}

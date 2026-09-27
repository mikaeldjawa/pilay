"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  updateSetting,
  createCounselingCategory,
  setCounselingCategoryActive,
  updateCounselingCategory,
  createIncidentCategory,
  setIncidentCategoryActive,
  updateIncidentCategory,
  createBehaviorCategory,
  setBehaviorCategoryActive,
  updateBehaviorCategory,
  createActionCode,
  setActionCodeActive,
  updateActionCode,
  createRiskDimension,
  setRiskDimensionActive,
  updateRiskDimension,
  createDocumentCategory,
  updateDocumentCategory,
  createSubject,
  setSubjectActive,
  updateSubject,
  deleteSubject,
  deleteCounselingCategory,
  deleteIncidentCategory,
  deleteBehaviorCategory,
  deleteActionCode,
  deleteRiskDimension,
  deleteDocumentCategory,
  deleteAcademicYear,
  deleteGrade,
  deleteClass,
  deleteReportingPeriod,
  createAcademicYear,
  setCurrentAcademicYear,
  updateAcademicYear,
  createGrade,
  updateGrade,
  createClass,
  updateClass,
  createReportingPeriod,
  updateReportingPeriod,
  SettingsServiceError,
} from "@/modules/settings/settings.service";
import {
  createSimpleLookupSchema,
  updateSimpleLookupSchema,
  createBehaviorCategorySchema,
  updateBehaviorCategorySchema,
  createAcademicYearSchema,
  updateAcademicYearSchema,
  createGradeSchema,
  updateGradeSchema,
  createClassSchema,
  updateClassSchema,
  createReportingPeriodSchema,
  updateReportingPeriodSchema,
} from "@/modules/settings/settings.schema";
import type { ActionState } from "@/modules/students/student.actions";

export async function updateSettingAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const key = String(formData.get("key") ?? "");
  const value = String(formData.get("value") ?? "");
  if (!key) return;

  await updateSetting(key, value, session.user.id);
  revalidatePath("/settings");
}

export async function createCounselingCategoryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = createSimpleLookupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await createCounselingCategory(parsed.data, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }

  updateTag("counseling-categories");
  revalidatePath("/settings");
  return {};
}

export async function updateCounselingCategoryAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = updateSimpleLookupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await updateCounselingCategory(id, parsed.data, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }

  updateTag("counseling-categories");
  revalidatePath("/settings");
  return {};
}

export async function createIncidentCategoryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = createSimpleLookupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await createIncidentCategory(parsed.data, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }

  updateTag("incident-categories");
  revalidatePath("/settings");
  return {};
}

export async function updateIncidentCategoryAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = updateSimpleLookupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await updateIncidentCategory(id, parsed.data, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }

  updateTag("incident-categories");
  revalidatePath("/settings");
  return {};
}

export async function createActionCodeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = createSimpleLookupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await createActionCode(parsed.data, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }
  updateTag("action-codes");
  revalidatePath("/settings");
  return {};
}

export async function updateActionCodeAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = updateSimpleLookupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await updateActionCode(id, parsed.data, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }
  updateTag("action-codes");
  revalidatePath("/settings");
  return {};
}

export async function createRiskDimensionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = createSimpleLookupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await createRiskDimension(parsed.data, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }
  revalidatePath("/settings");
  return {};
}

export async function updateRiskDimensionAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = updateSimpleLookupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await updateRiskDimension(id, parsed.data, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }
  revalidatePath("/settings");
  return {};
}

export async function createDocumentCategoryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = createSimpleLookupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await createDocumentCategory(parsed.data, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }
  updateTag("document-categories");
  revalidatePath("/settings");
  return {};
}

export async function updateDocumentCategoryAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = updateSimpleLookupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await updateDocumentCategory(id, parsed.data, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }
  updateTag("document-categories");
  revalidatePath("/settings");
  return {};
}

export async function createBehaviorCategoryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = createBehaviorCategorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await createBehaviorCategory(parsed.data, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }
  updateTag("behavior-categories");
  revalidatePath("/settings");
  return {};
}

export async function updateBehaviorCategoryAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = updateBehaviorCategorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await updateBehaviorCategory(id, parsed.data, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }
  updateTag("behavior-categories");
  revalidatePath("/settings");
  return {};
}

export async function createSubjectAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = createSimpleLookupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await createSubject(parsed.data, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }
  updateTag("subjects");
  revalidatePath("/settings");
  return {};
}

export async function updateSubjectAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = updateSimpleLookupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await updateSubject(id, parsed.data, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }
  updateTag("subjects");
  revalidatePath("/settings");
  return {};
}

export async function toggleSubjectAction(id: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  await setSubjectActive(id, isActive, session.user.id);
  updateTag("subjects");
  revalidatePath("/settings");
}

export async function deleteSubjectAction(id: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  try {
    await deleteSubject(id, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }
  updateTag("subjects");
  revalidatePath("/settings");
  return {};
}

export async function deleteCounselingCategoryAction(id: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  try {
    await deleteCounselingCategory(id, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }
  updateTag("counseling-categories");
  revalidatePath("/settings");
  return {};
}

export async function deleteIncidentCategoryAction(id: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  try {
    await deleteIncidentCategory(id, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }
  updateTag("incident-categories");
  revalidatePath("/settings");
  return {};
}

export async function deleteBehaviorCategoryAction(id: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  try {
    await deleteBehaviorCategory(id, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }
  updateTag("behavior-categories");
  revalidatePath("/settings");
  return {};
}

export async function deleteActionCodeAction(id: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  try {
    await deleteActionCode(id, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }
  updateTag("action-codes");
  revalidatePath("/settings");
  return {};
}

export async function deleteRiskDimensionAction(id: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  try {
    await deleteRiskDimension(id, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }
  revalidatePath("/settings");
  return {};
}

export async function deleteDocumentCategoryAction(id: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  try {
    await deleteDocumentCategory(id, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }
  updateTag("document-categories");
  revalidatePath("/settings");
  return {};
}

export async function deleteAcademicYearAction(id: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  try {
    await deleteAcademicYear(id, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }
  revalidatePath("/settings");
  return {};
}

export async function deleteGradeAction(id: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  try {
    await deleteGrade(id, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }
  updateTag("grades");
  revalidatePath("/settings");
  return {};
}

export async function deleteClassAction(id: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  try {
    await deleteClass(id, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }
  updateTag("classes");
  revalidatePath("/settings");
  return {};
}

export async function deleteReportingPeriodAction(id: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");
  try {
    await deleteReportingPeriod(id, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }
  revalidatePath("/settings");
  return {};
}

export async function toggleCounselingCategoryAction(id: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  await setCounselingCategoryActive(id, isActive, session.user.id);
  updateTag("counseling-categories");
  revalidatePath("/settings");
}

export async function toggleIncidentCategoryAction(id: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  await setIncidentCategoryActive(id, isActive, session.user.id);
  updateTag("incident-categories");
  revalidatePath("/settings");
}

export async function toggleBehaviorCategoryAction(id: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  await setBehaviorCategoryActive(id, isActive, session.user.id);
  updateTag("behavior-categories");
  revalidatePath("/settings");
}

export async function toggleActionCodeAction(id: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  await setActionCodeActive(id, isActive, session.user.id);
  updateTag("action-codes");
  revalidatePath("/settings");
}

export async function toggleRiskDimensionAction(id: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  await setRiskDimensionActive(id, isActive, session.user.id);
  revalidatePath("/settings");
}

export async function createAcademicYearAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = createAcademicYearSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await createAcademicYear(parsed.data, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }
  revalidatePath("/settings");
  return {};
}

export async function updateAcademicYearAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = updateAcademicYearSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await updateAcademicYear(id, parsed.data, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }
  revalidatePath("/settings");
  return {};
}

export async function setCurrentAcademicYearAction(id: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  await setCurrentAcademicYear(id, session.user.id);
  revalidatePath("/settings");
}

export async function createGradeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = createGradeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await createGrade(parsed.data, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }
  updateTag("grades");
  revalidatePath("/settings");
  return {};
}

export async function updateGradeAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = updateGradeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await updateGrade(id, parsed.data, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }
  updateTag("grades");
  revalidatePath("/settings");
  return {};
}

export async function createClassAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = createClassSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await createClass(parsed.data, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }
  updateTag("classes");
  revalidatePath("/settings");
  return {};
}

export async function updateClassAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = updateClassSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await updateClass(id, parsed.data, session.user.id);
  } catch (error) {
    if (error instanceof SettingsServiceError) return { error: error.message };
    throw error;
  }
  updateTag("classes");
  revalidatePath("/settings");
  return {};
}

export async function createReportingPeriodAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = createReportingPeriodSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await createReportingPeriod(parsed.data, session.user.id);
  revalidatePath("/settings");
  return {};
}

export async function updateReportingPeriodAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = updateReportingPeriodSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await updateReportingPeriod(id, parsed.data, session.user.id);
  revalidatePath("/settings");
  return {};
}

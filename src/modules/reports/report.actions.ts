"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  generateCounselingCaseReport,
  generateMajorIncidentReport,
  generateMinorBehaviorLogReport,
  generateStudentIncidentHistoryReport,
  ReportServiceError,
} from "@/modules/reports/report.service";
import type { ActionState } from "@/modules/students/student.actions";
import { withSuccessFlash } from "@/lib/flash";

export async function generateCounselingCaseReportAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const counselingSessionId = String(formData.get("counselingSessionId") ?? "");
  const securityClassification = String(formData.get("securityClassification") ?? "Confidential");
  const designatedTo = String(formData.get("designatedTo") ?? "School Leadership");

  if (!counselingSessionId) {
    return { error: "A counseling session must be selected." };
  }

  let reportId: string;
  try {
    const report = await generateCounselingCaseReport(
      counselingSessionId,
      { securityClassification, designatedTo },
      session.user.id,
    );
    reportId = report.id;
  } catch (error) {
    if (error instanceof ReportServiceError) return { error: error.message };
    throw error;
  }

  revalidatePath("/reports");
  redirect(withSuccessFlash(`/reports/${reportId}`, "Report generated"));
}

export async function generateMajorIncidentReportAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const incidentId = String(formData.get("incidentId") ?? "");
  if (!incidentId) {
    return { error: "An incident must be selected." };
  }

  let reportId: string;
  try {
    const report = await generateMajorIncidentReport(incidentId, session.user.id);
    reportId = report.id;
  } catch (error) {
    if (error instanceof ReportServiceError) return { error: error.message };
    throw error;
  }

  revalidatePath("/reports");
  redirect(withSuccessFlash(`/reports/${reportId}`, "Report generated"));
}

export async function generateMinorBehaviorLogReportAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const dateFrom = String(formData.get("dateFrom") ?? "");
  const dateTo = String(formData.get("dateTo") ?? "");
  const classroomReference = String(formData.get("classroomReference") ?? "");
  const classId = String(formData.get("classId") ?? "");

  if (!dateFrom || !dateTo) {
    return { error: "Date range is required." };
  }

  let reportId: string;
  try {
    const report = await generateMinorBehaviorLogReport(
      {
        dateFrom: new Date(dateFrom),
        dateTo: new Date(dateTo),
        classroomReference: classroomReference || undefined,
        classId: classId && classId !== "all" ? classId : undefined,
      },
      session.user.id,
    );
    reportId = report.id;
  } catch (error) {
    if (error instanceof ReportServiceError) return { error: error.message };
    throw error;
  }

  revalidatePath("/reports");
  redirect(withSuccessFlash(`/reports/${reportId}`, "Report generated"));
}

export async function generateStudentIncidentHistoryReportAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const studentId = String(formData.get("studentId") ?? "");
  if (!studentId) {
    return { error: "A student must be selected." };
  }

  let reportId: string;
  try {
    const report = await generateStudentIncidentHistoryReport(studentId, session.user.id);
    reportId = report.id;
  } catch (error) {
    if (error instanceof ReportServiceError) return { error: error.message };
    throw error;
  }

  revalidatePath("/reports");
  redirect(withSuccessFlash(`/reports/${reportId}`, "Report generated"));
}

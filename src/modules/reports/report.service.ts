import type { ReportType } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { isUniqueConstraintViolation } from "@/lib/prisma-errors";
import { formatStudentName } from "@/lib/utils";
import { logAudit } from "@/modules/audit/audit.service";
import * as storage from "@/modules/documents/storage.service";
import { renderHtmlToPdf } from "@/modules/reports/pdf.service";
import { renderCounselingCaseReport } from "@/modules/reports/renderers/counseling-case-report";
import {
  renderCounselingCaseHeader,
  renderCounselingCaseFooter,
} from "@/modules/reports/renderers/counseling-case-report/chrome";
import { renderMajorIncidentReport } from "@/modules/reports/renderers/major-incident-report";
import {
  renderMajorIncidentHeader,
  renderMajorIncidentFooter,
} from "@/modules/reports/renderers/major-incident-report/chrome";
import { renderMinorBehaviorLog } from "@/modules/reports/renderers/minor-behavior-log";
import {
  renderMinorBehaviorLogHeader,
  renderMinorBehaviorLogFooter,
} from "@/modules/reports/renderers/minor-behavior-log/chrome";
import { renderStudentFullReport } from "@/modules/reports/renderers/student-full-report";
import {
  renderStudentFullReportHeader,
  renderStudentFullReportFooter,
} from "@/modules/reports/renderers/student-full-report/chrome";
import { nextReportNumber } from "@/modules/reports/report-number.service";
import {
  gatherCounselingCaseData,
  gatherMajorIncidentData,
  gatherMinorBehaviorLogData,
  gatherStudentFullReportData,
} from "@/modules/reports/report-query.service";
import { SETTING_KEYS } from "@/modules/settings/settings.service";

export class ReportServiceError extends Error {}

// School name / confidentiality notice live in Settings (General card) —
// fetched once per generation and stamped into the running header/footer of
// every page via pdf.service.ts, not baked into any one template.
async function getReportChrome() {
  const settings = await db.systemSetting.findMany({
    where: { key: { in: [SETTING_KEYS.SCHOOL_NAME, SETTING_KEYS.CONFIDENTIALITY_NOTICE] } },
  });
  const byKey = new Map(settings.map((s) => [s.key, s.value]));

  return {
    schoolName: byKey.get(SETTING_KEYS.SCHOOL_NAME) || "School",
    confidentialityNotice:
      byKey.get(SETTING_KEYS.CONFIDENTIALITY_NOTICE) || "Confidential — For authorized personnel only",
  };
}

async function startReport(params: {
  reportType: ReportType;
  studentId?: string;
  generatedByUserId: string;
  dateFrom?: Date;
  dateTo?: Date;
  securityClassification?: string;
  designatedTo?: string;
  documentTitle?: string;
  relatedIncidentId?: string;
  relatedSessionId?: string;
}) {
  const template = await db.reportTemplate.findFirstOrThrow({
    where: { reportType: params.reportType, isActive: true },
  });

  // nextReportNumber() picks the next free number outside any row lock, so a
  // genuine concurrent generation (two submits landing at once) can still
  // race for the same number. Retry a few times with a freshly recomputed
  // number rather than surfacing the raw unique-constraint error.
  const MAX_ATTEMPTS = 5;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await db.$transaction(async (tx) => {
        const now = new Date();
        const reportNumber = await nextReportNumber(
          tx,
          params.reportType,
          now.getFullYear(),
        );

        return tx.generatedReport.create({
          data: {
            reportNumber,
            reportTemplateId: template.id,
            reportType: params.reportType,
            studentId: params.studentId,
            generatedByUserId: params.generatedByUserId,
            dateFrom: params.dateFrom,
            dateTo: params.dateTo,
            templateVersion: template.templateVersion,
            status: "GENERATING",
            securityClassification: params.securityClassification,
            designatedTo: params.designatedTo,
            documentTitle: params.documentTitle,
            relatedIncidentId: params.relatedIncidentId,
            relatedSessionId: params.relatedSessionId,
          },
        });
      });
    } catch (error) {
      const isReportNumberConflict = isUniqueConstraintViolation(error, "report_number");

      if (!isReportNumberConflict || attempt === MAX_ATTEMPTS) {
        throw error;
      }
    }
  }

  throw new ReportServiceError("Could not allocate a unique report number.");
}

async function finishReport(
  reportId: string,
  generatedByUserId: string,
  snapshotData: unknown,
  pdf: Buffer,
  fileName: string,
) {
  const storageKey = `reports/${reportId}/${fileName}`;
  await storage.put(storageKey, pdf);

  return db.$transaction(async (tx) => {
    await tx.reportDataSnapshot.create({
      data: {
        generatedReportId: reportId,
        snapshotData: snapshotData as object,
      },
    });

    const report = await tx.generatedReport.findUniqueOrThrow({
      where: { id: reportId },
    });

    const documentCategoryName =
      report.reportType === "INCIDENT_MAJOR"
        ? "Incident Report"
        : report.reportType === "BEHAVIOR_LOG_MINOR"
          ? "Behavior Log"
          : report.reportType === "STUDENT_SUMMARY"
            ? "Student Summary"
            : "Counseling Report";
    const documentCategory = await tx.documentCategory.findFirstOrThrow({
      where: { name: documentCategoryName },
    });

    await tx.document.create({
      data: {
        studentId: report.studentId,
        documentCategoryId: documentCategory.id,
        title: report.documentTitle ?? report.reportNumber,
        fileName,
        storageKey,
        mimeType: "application/pdf",
        fileSize: pdf.byteLength,
        uploadedByUserId: generatedByUserId,
        generatedReportId: reportId,
      },
    });

    const updated = await tx.generatedReport.update({
      where: { id: reportId },
      data: { status: "READY", storageKey, fileName, generatedAt: new Date() },
    });

    await logAudit(tx, {
      userId: generatedByUserId,
      action: "GENERATE_REPORT",
      entityType: "generated_report",
      entityId: reportId,
    });

    return updated;
  });
}

async function failReport(reportId: string) {
  await db.generatedReport.update({
    where: { id: reportId },
    data: { status: "FAILED" },
  });
}

export async function generateCounselingCaseReport(
  counselingSessionId: string,
  options: { securityClassification: string; designatedTo: string },
  generatedByUserId: string,
) {
  const session = await gatherCounselingCaseData(counselingSessionId);
  const subject = session.subjectStudent ?? session.student;
  const documentTitle = `School Counseling Report: ${session.sessionDate.toLocaleDateString()} — ${formatStudentName(subject)}`;
  const { schoolName } = await getReportChrome();

  const report = await startReport({
    reportType: "COUNSELING_CASE",
    studentId: subject.id,
    generatedByUserId,
    securityClassification: options.securityClassification,
    designatedTo: options.designatedTo,
    documentTitle,
    relatedSessionId: counselingSessionId,
  });

  try {
    const pdf = await renderHtmlToPdf(
      renderCounselingCaseReport({
        session,
        reportNumber: report.reportNumber,
        documentTitle,
        securityClassification: options.securityClassification,
        designatedTo: options.designatedTo,
      }),
      false,
      {
        headerTemplate: renderCounselingCaseHeader({ schoolName, reportNumber: report.reportNumber }),
        footerTemplate: renderCounselingCaseFooter({
          footerNotice: `${options.securityClassification} — Report ${report.reportNumber}`,
        }),
      },
    );
    return await finishReport(
      report.id,
      generatedByUserId,
      session,
      pdf,
      `${report.reportNumber}.pdf`,
    );
  } catch (error) {
    await failReport(report.id);
    throw error;
  }
}

export async function generateMajorIncidentReport(
  incidentId: string,
  generatedByUserId: string,
) {
  const incident = await gatherMajorIncidentData(incidentId);
  const { schoolName, confidentialityNotice } = await getReportChrome();

  const report = await startReport({
    reportType: "INCIDENT_MAJOR",
    studentId: incident.primaryStudentId,
    generatedByUserId,
    documentTitle: `Major Incident Report — ${incident.incidentNumber}`,
    relatedIncidentId: incidentId,
  });

  try {
    const pdf = await renderHtmlToPdf(
      renderMajorIncidentReport({
        incident,
        reportNumber: report.reportNumber,
      }),
      false,
      {
        headerTemplate: renderMajorIncidentHeader({ schoolName, reportNumber: report.reportNumber }),
        footerTemplate: renderMajorIncidentFooter({
          footerNotice: `${confidentialityNotice} — ${report.reportNumber}`,
        }),
      },
    );
    return await finishReport(
      report.id,
      generatedByUserId,
      incident,
      pdf,
      `${report.reportNumber}.pdf`,
    );
  } catch (error) {
    await failReport(report.id);
    throw error;
  }
}

export async function generateMinorBehaviorLogReport(
  params: { dateFrom: Date; dateTo: Date; classroomReference?: string; classId?: string },
  generatedByUserId: string,
) {
  const rows = await gatherMinorBehaviorLogData(params);
  const { schoolName, confidentialityNotice } = await getReportChrome();
  const selectedClass = params.classId
    ? await db.class.findUnique({ where: { id: params.classId } })
    : null;

  const report = await startReport({
    reportType: "BEHAVIOR_LOG_MINOR",
    generatedByUserId,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    documentTitle: `Minor Behavior Log — ${params.dateFrom.toLocaleDateString()} to ${params.dateTo.toLocaleDateString()}`,
  });

  try {
    const pdf = await renderHtmlToPdf(
      renderMinorBehaviorLog({
        rows,
        reportNumber: report.reportNumber,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        classroomReference: params.classroomReference,
        className: selectedClass?.name,
      }),
      true,
      {
        headerTemplate: renderMinorBehaviorLogHeader({ schoolName, reportNumber: report.reportNumber }),
        footerTemplate: renderMinorBehaviorLogFooter({
          footerNotice: `${confidentialityNotice} — ${report.reportNumber}`,
        }),
      },
    );
    return await finishReport(
      report.id,
      generatedByUserId,
      rows,
      pdf,
      `${report.reportNumber}.pdf`,
    );
  } catch (error) {
    await failReport(report.id);
    throw error;
  }
}

export async function generateStudentIncidentHistoryReport(
  studentId: string,
  generatedByUserId: string,
) {
  const data = await gatherStudentFullReportData(studentId);
  const { schoolName, confidentialityNotice } = await getReportChrome();
  const generatedAt = new Date();

  const report = await startReport({
    reportType: "STUDENT_SUMMARY",
    studentId,
    generatedByUserId,
    documentTitle: `Student Full Report — ${formatStudentName(data.student)}`,
  });

  try {
    const pdf = await renderHtmlToPdf(
      renderStudentFullReport({
        data,
        reportNumber: report.reportNumber,
        generatedAt,
        schoolName,
      }),
      false,
      {
        headerTemplate: renderStudentFullReportHeader({ schoolName, reportNumber: report.reportNumber }),
        footerTemplate: renderStudentFullReportFooter({
          footerNotice: `${confidentialityNotice} — ${report.reportNumber}`,
        }),
      },
    );
    return await finishReport(
      report.id,
      generatedByUserId,
      data,
      pdf,
      `${report.reportNumber}.pdf`,
    );
  } catch (error) {
    await failReport(report.id);
    throw error;
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { renderCounselingCaseReport } from "@/modules/reports/renderers/counseling-case-report";
import { MOCK_COUNSELING_SESSION } from "@/modules/reports/renderers/counseling-case-report/mock-data";
import { renderMajorIncidentReport } from "@/modules/reports/renderers/major-incident-report";
import { MOCK_MAJOR_INCIDENT } from "@/modules/reports/renderers/major-incident-report/mock-data";
import { renderMinorBehaviorLog } from "@/modules/reports/renderers/minor-behavior-log";
import {
  MOCK_MINOR_BEHAVIOR_ROWS,
  MOCK_DATE_FROM,
  MOCK_DATE_TO,
} from "@/modules/reports/renderers/minor-behavior-log/mock-data";
import { renderStudentFullReport } from "@/modules/reports/renderers/student-full-report";
import { MOCK_STUDENT_FULL_REPORT } from "@/modules/reports/renderers/student-full-report/mock-data";

// Dev-only: renders a report template straight to HTML using fixed mock
// data, skipping the database, report numbering, PDF conversion, and
// storage entirely. Point a browser tab at this route and refresh after
// editing a renderer/CSS/section file — much faster than generating a real
// document while the template layout is still being worked out, and it
// works with an empty database.
export async function GET(_request: Request, { params }: { params: Promise<{ type: string }> }) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { type } = await params;
  let html: string;

  if (type === "major") {
    html = renderMajorIncidentReport({
      incident: MOCK_MAJOR_INCIDENT,
      reportNumber: MOCK_MAJOR_INCIDENT.incidentNumber,
    });
  } else if (type === "counseling") {
    html = renderCounselingCaseReport({
      session: MOCK_COUNSELING_SESSION,
      reportNumber: "PREVIEW-0000",
      documentTitle: "Counseling Case Report (Preview)",
      securityClassification: "CONFIDENTIAL",
      designatedTo: "School Principal",
    });
  } else if (type === "minor") {
    html = renderMinorBehaviorLog({
      rows: MOCK_MINOR_BEHAVIOR_ROWS,
      reportNumber: "PREVIEW-0000",
      dateFrom: MOCK_DATE_FROM,
      dateTo: MOCK_DATE_TO,
    });
  } else if (type === "student") {
    html = renderStudentFullReport({
      data: MOCK_STUDENT_FULL_REPORT,
      reportNumber: "PREVIEW-0000",
      generatedAt: new Date(),
    });
  } else {
    return new NextResponse("Unknown report type. Use major, minor, counseling, or student.", { status: 400 });
  }

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

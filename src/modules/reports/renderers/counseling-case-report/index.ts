import {
  type SessionData,
  formatSessionTimeRange,
  renderActionPlanSection,
  renderDocumentTitle,
  renderNarrativeSection,
  renderObjectiveFindingsSection,
  renderPresentationSection,
  renderReportInfo,
  renderSessionGlance,
  renderSummarySection,
} from "@/modules/reports/renderers/counseling-case-report/sections";
import { COUNSELING_CASE_CSS } from "@/modules/reports/renderers/counseling-case-report/styles";
import { formatDateLong } from "@/modules/reports/renderers/shared/format";
import { reportDocument } from "@/modules/reports/renderers/shared/report-document";

// Everything the counseling case report renders below its own `<style>` tag
// — extracted so a merged multi-section student report can embed the exact
// same template content without a second, conflicting `reportDocument()`
// (and therefore `<html>`/`<head>`) wrapper.
export function renderCounselingCaseBody(params: {
  session: SessionData;
  reportNumber: string;
  documentTitle: string;
  securityClassification: string;
  designatedTo: string;
}) {
  const {
    session,
    reportNumber,
    documentTitle,
    securityClassification,
    designatedTo,
  } = params;

  const attendingStudent = session.student;
  const subject = session.subjectStudent ?? null;
  const isEscalated = !!session.subjectStudent;

  const counselorName = session.counselor?.fullName ?? "—";
  const sessionDate = formatDateLong(session.sessionDate);
  const sessionTime = formatSessionTimeRange(
    session.startTime,
    session.endTime,
  );

  const presentation = session.note?.presentationEngagement ?? "—";
  const emotionalAffect = session.note?.emotionalAffect ?? "—";
  const credibility = session.note?.credibilityObjectivity ?? "—";
  const credibilityRating = session.note?.credibilityRating ?? "";

  const sessionPurpose = session.counselingCategory?.name
    ? `Individual Check-In regarding ${session.counselingCategory.name}`
    : "Individual Counseling Session";

  return `
    <div class="report-page">
      ${renderDocumentTitle(documentTitle)}
      ${renderReportInfo({
        documentTitle,
        reportNumber,
        securityClassification,
        sessionDate,
        counselorName,
        designatedTo,
      })}
      ${renderSessionGlance({
        attendingStudent,
        subject,
        isEscalated,
        counselorName,
        sessionDate,
        sessionTime,
        sessionPurpose,
      })}
      ${renderPresentationSection({
        presentation,
        emotionalAffect,
        credibility,
        credibilityRating,
      })}
      ${renderNarrativeSection(session)}
      ${renderObjectiveFindingsSection(session)}
      ${renderActionPlanSection(session)}
      ${renderSummarySection(session, counselorName)}

    </div>
  `;
}

export function renderCounselingCaseReport(params: {
  session: SessionData;
  reportNumber: string;
  documentTitle: string;
  securityClassification: string;
  designatedTo: string;
}) {
  const body = `
    <style>${COUNSELING_CASE_CSS}</style>
    ${renderCounselingCaseBody(params)}
  `;

  return reportDocument({
    title: params.documentTitle,
    body,
  });
}

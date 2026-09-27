import { renderCounselingCaseBody } from "@/modules/reports/renderers/counseling-case-report";
import { COUNSELING_CASE_CSS } from "@/modules/reports/renderers/counseling-case-report/styles";
import { renderMajorIncidentBody } from "@/modules/reports/renderers/major-incident-report";
import { MAJOR_INCIDENT_CSS } from "@/modules/reports/renderers/major-incident-report/styles";
import { renderCodeLegend, renderRecordsTable } from "@/modules/reports/renderers/minor-behavior-log/sections";
import { MINOR_BEHAVIOR_LOG_CSS } from "@/modules/reports/renderers/minor-behavior-log/styles";
import { reportDocument } from "@/modules/reports/renderers/shared/report-document";
import { formatDateLong } from "@/modules/reports/renderers/shared/format";
import {
  type StudentFullReportData,
  renderCoverPage,
  renderSectionDivider,
} from "@/modules/reports/renderers/student-full-report/sections";
import { STUDENT_FULL_REPORT_CSS } from "@/modules/reports/renderers/student-full-report/styles";

// Each standalone report's stylesheet sets its own `@page` size and its own
// top-level `body`/`html` typography — fine when that stylesheet is the only
// one in the document, but three of these concatenated in one page would
// otherwise fight over global `@page`/`body` rules (last one in document
// order wins the whole document, not just its own section, since raw
// `<style>` blocks aren't scoped to where they appear). Strip those two
// global rule types from each embedded stylesheet; every class-scoped rule
// (`.report-page`, `.metadata-table`, `.log-table`, …) is left untouched and
// reused verbatim, and the merged document's own `@page`/`body` rules (from
// `reportDocument()`'s shared CSS) apply consistently across every section.
function stripGlobalRules(css: string): string {
  return css
    .replace(/@page\s*{[^}]*}/g, "")
    .replace(/(?:html\s*,\s*)?(?<![\w-])body(?![\w-])\s*{[^}]*}/g, "");
}

const COUNSELING_CASE_CSS_SCOPED = stripGlobalRules(COUNSELING_CASE_CSS);
const MAJOR_INCIDENT_CSS_SCOPED = stripGlobalRules(MAJOR_INCIDENT_CSS);
const MINOR_BEHAVIOR_LOG_CSS_SCOPED = stripGlobalRules(MINOR_BEHAVIOR_LOG_CSS);

export function renderStudentFullReport(params: {
  data: StudentFullReportData;
  reportNumber: string;
  generatedAt: Date;
  schoolName?: string;
}) {
  const { data, reportNumber, generatedAt } = params;
  const schoolName = params.schoolName ?? "School";

  // Each sub-report is wrapped in `.sub-report`, whose styles break the page
  // only *between* siblings (`.sub-report + .sub-report`) — never before the
  // first. That keeps the section divider and the first sub-report on the same
  // page (the group wrapper already started a fresh page), instead of leaving
  // the divider stranded alone on an otherwise-blank page.
  const counselingSections = data.counselingSessions.length
    ? data.counselingSessions
        .map(
          (session) => `
            <div class="sub-report">
              ${renderCounselingCaseBody({
                session,
                reportNumber,
                documentTitle: `Counseling Session — ${formatDateLong(session.sessionDate)}`,
                securityClassification: "Confidential",
                designatedTo: "School Records",
              })}
            </div>
          `,
        )
        .join("")
    : `<p class="empty-note">No counseling sessions on record.</p>`;

  const incidentSections = data.incidents.length
    ? data.incidents
        .map(
          (incident) => `
            <div class="sub-report">
              ${renderMajorIncidentBody({ incident, reportNumber: incident.incidentNumber })}
            </div>
          `,
        )
        .join("")
    : `<p class="empty-note">No major incidents on record.</p>`;

  const minorSection = data.behaviorRows.length
    ? `${renderCodeLegend()}${renderRecordsTable(data.behaviorRows)}`
    : `<p class="empty-note">No minor behavior logs on record.</p>`;

  const body = `
    <style>${STUDENT_FULL_REPORT_CSS}</style>
    ${renderCoverPage({ data, reportNumber, generatedAt, schoolName })}

    <div class="section-break">
      ${renderSectionDivider(`Counseling Sessions (${data.counselingSessions.length})`)}
      <style>${COUNSELING_CASE_CSS_SCOPED}</style>
      ${counselingSections}
    </div>

    <div class="section-break">
      ${renderSectionDivider(`Major Incidents (${data.incidents.length})`)}
      <style>${MAJOR_INCIDENT_CSS_SCOPED}</style>
      ${incidentSections}
    </div>

    <div class="section-break">
      ${renderSectionDivider(`Minor Behavior Logs (${data.behaviorRows.length})`)}
      <style>${MINOR_BEHAVIOR_LOG_CSS_SCOPED}</style>
      ${minorSection}
    </div>
  `;

  return reportDocument({
    title: `Student Full Report ${reportNumber}`,
    landscape: false,
    body,
  });
}

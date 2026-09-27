import {
  displayValueOrDash,
  formatDateLong,
} from "@/modules/reports/renderers/shared/format";
import { esc } from "@/modules/reports/renderers/shared/html";
import type { gatherCounselingCaseData } from "@/modules/reports/report-query.service";
import { formatStudentName } from "@/lib/utils";

export type SessionData = Awaited<ReturnType<typeof gatherCounselingCaseData>>;
type Student = SessionData["subjectStudent"];

function safe(value: unknown): string {
  return displayValueOrDash(value);
}

function formatTimeOfDay(value: string): string {
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return "";

  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function formatSessionTimeRange(
  startTime: string | null,
  endTime: string | null,
): string {
  if (!startTime) return "";

  const start = formatTimeOfDay(startTime);
  if (!endTime) return start;

  const end = formatTimeOfDay(endTime);
  return `${start} – ${end}`;
}

export function studentName(student: Student): string {
  if (!student) return "—";

  const name = formatStudentName(student);
  if (!name) {
    return student.studentId ? String(student.studentId) : "—";
  }

  return name;
}

export function studentDisplay(student: Student): string {
  if (!student) return "—";

  const name = studentName(student);
  const id = student.studentId ? ` (${student.studentId})` : "";

  return `${name}${id}`;
}

export function numberedList(
  items: { id: string; title: string; body: string }[],
) {
  if (!items?.length) {
    return `<div class="empty-value">—</div>`;
  }

  return `
    <div class="numbered-list">
      ${items
        .map(
          (item, index) => `
            <div class="numbered-item">
              <div class="numbered-title">
                (${index + 1}) ${safe(item.title)}
              </div>
              ${item.body ? `<div class="numbered-body">${safe(item.body)}</div>` : ""}
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

export function sectionHeading(number: string, title: string) {
  return `
    <div class="section-heading">
      <span class="section-number">${number}.</span>
      <span>${esc(title)}</span>
    </div>
  `;
}

export function subsectionHeading(letter: string, title: string) {
  return `
    <div class="subsection-heading">
      <span>${letter}.</span>
      <span>${esc(title)}</span>
    </div>
  `;
}

export function detailRow(label: string, value: string) {
  return `
    <div class="detail-row">
      <div class="detail-label">
        ${esc(label)}
      </div>
      <div class="detail-value">
        ${value}
      </div>
    </div>
  `;
}

export function renderPrivacyNotice() {
  return `
    <div class="privacy-notice">
      <strong>PRIVACY NOTICE:</strong>
      <em>
        This report contains private counseling information.
        It is intended strictly for the St. Peter’s School Leadership Team.
        Unauthorized sharing or copying is strictly prohibited.
      </em>
    </div>
  `;
}

function calloutStart(title: string, icon = "") {
  return `
    <div class="callout">
      <div class="callout-title">
        ${icon ? `<span class="callout-icon">${icon}</span>` : ""}
        ${esc(title)}
      </div>
  `;
}

function calloutEnd() {
  return `</div>`;
}

function riskLevel(level: string) {
  const normalized = level.toUpperCase();

  let className = "risk-normal";
  if (normalized.includes("CRITICAL")) {
    className = "risk-critical";
  } else if (normalized.includes("HIGH")) {
    className = "risk-high";
  } else if (normalized.includes("MEDIUM")) {
    className = "risk-medium";
  } else if (normalized.includes("LOW")) {
    className = "risk-low";
  }

  return `
    <span class="risk-level ${className}">
      ${safe(level)}
    </span>
  `;
}

export function renderDocumentTitle(documentTitle: string) {
  return `
    <div class="document-title">
      ${esc(documentTitle)}
    </div>
  `;
}

export function renderReportInfo(params: {
  documentTitle: string;
  reportNumber: string;
  securityClassification: string;
  sessionDate: string;
  counselorName: string;
  designatedTo: string;
}) {
  return `
    <div class="report-meta">
      ${detailRow("Document Title", safe(params.documentTitle))}
      ${detailRow("Report Number", safe(params.reportNumber))}
      ${detailRow("Security Classification", `<em>${safe(params.securityClassification)}</em>`)}
      ${detailRow("Date of Report", formatDateLong(new Date()))}
      ${detailRow("Date of Counseling Session", params.sessionDate)}
      ${detailRow("Report Prepared By", `School Counselor – ${safe(params.counselorName)}`)}
      ${detailRow("Report Designated To", safe(params.designatedTo))}
      ${detailRow("Class / Grade", "—")}
      <div class="meta-bottom-bar"></div>
    </div>
  `;
}

export function renderSessionGlance(params: {
  attendingStudent: Student;
  subject: Student;
  isEscalated: boolean;
  counselorName: string;
  sessionDate: string;
  sessionTime: string;
  sessionPurpose: string;
}) {
  return `
    <div class="glance-title">
      SESSION DETAILS AT A GLANCE
    </div>
    <div class="glance-table">
      <div class="glance-row">
        <div class="glance-label">
          Attending Student (Interviewed)
        </div>
        <div class="glance-separator">
          :
        </div>
        <div class="glance-value">
          <strong>${studentDisplay(params.attendingStudent)}</strong>
        </div>
      </div>
      ${
        params.isEscalated
          ? `
            <div class="glance-row">
              <div class="glance-label">
                Subject Student (Case Focus)
              </div>

              <div class="glance-separator">
                :
              </div>

              <div class="glance-value">
                ${studentDisplay(params.subject)}
              </div>
            </div>
          `
          : ""
      }
      <div class="glance-row">
        <div class="glance-label">
          Counselor &amp; Time
        </div>
        <div class="glance-separator">
          :
        </div>
        <div class="glance-value">
          ${safe(params.counselorName)}
          ${params.sessionDate ? ` | ${params.sessionDate}` : ""}
          ${params.sessionTime ? ` – ${params.sessionTime}` : ""}
        </div>
      </div>
      <div class="glance-row">
        <div class="glance-label">
          Session Purpose
        </div>
        <div class="glance-separator">
          :
        </div>
        <div class="glance-value">
          ${safe(params.sessionPurpose)}
        </div>
      </div>
    </div>
  `;
}

export function renderPresentationSection(params: {
  presentation: string;
  emotionalAffect: string;
  credibility: string;
  credibilityRating: string;
}) {
  return `
    ${sectionHeading("1", "Student Presentation & Demeanor")}
    <div class="presentation-block">
      <div class="presentation-item">
        <div class="presentation-title">
          (1) Presentation &amp; Engagement
        </div>
        <div class="presentation-body">
          ${safe(params.presentation)}
        </div>
      </div>
      <div class="presentation-item">
        <div class="presentation-title">
          (2) Emotional Affect
        </div>
        <div class="presentation-body">
          ${safe(params.emotionalAffect)}
        </div>
      </div>
      <div class="presentation-item">
        <div class="presentation-title">
          (3) Credibility &amp; Objectivity
        </div>
        <div class="presentation-body">
          ${safe(params.credibility)}
          ${params.credibilityRating ? ` <strong>(${safe(params.credibilityRating)})</strong>` : ""}
        </div>
      </div>
    </div>
  `;
}

export function renderNarrativeSection(session: SessionData) {
  const phaseLabels: Record<string, string> = {
    BEFORE: "Before the incident",
    DURING: "During the Incident (The Trigger)",
    AFTER: "After the Incident (The Escalation)",
  };

  const timelineMap = new Map<
    string,
    {
      phase: {
        key: string;
        label: string;
      };
      content: {
        title: string | null;
        body: string;
      }[];
    }
  >();

  for (const event of session.timelineEvents) {
    const existing = timelineMap.get(event.phase);

    const content = {
      title: event.title,
      body: event.body,
    };

    if (existing) {
      existing.content.push(content);
      continue;
    }

    timelineMap.set(event.phase, {
      phase: {
        key: event.phase,
        label: phaseLabels[event.phase] ?? event.phase,
      },
      content: [content],
    });
  }

  const fixTimeLineEvent = Array.from(timelineMap.values());

  return `
    ${sectionHeading(
      "2",
      "Student Session Narrative (Attending Student's Account & Observations)",
    )}
    ${calloutStart("Executive Highlight: Key Takeaways From Student's Narrative", "★")}
    ${numberedList(session.keyTakeaways)}
    ${calloutEnd()}
    ${subsectionHeading("A", "Timeline of the Incident (As Described by Student)")}
    <table class="timeline-table">
     <tbody>
  ${
    fixTimeLineEvent?.length
      ? fixTimeLineEvent
          .map(
            (event: any) => `
              <tr>
                <td class="timeline-phase">
                  ${safe(event.phase?.label ?? event.phase ?? "")}
                </td>

                <td class="timeline-separator">
                  :
                </td>

                <td class="timeline-content">
                  ${
                    event.content?.length
                      ? event.content
                          .map(
                            (content: any) => `
                              <div class="timeline-content-item">
                                ${
                                  content.title
                                    ? `
                                      <div class="timeline-event-title">
                                        ${safe(content.title)}
                                      </div>
                                    `
                                    : ""
                                }

                                <div class="timeline-event-body">
                                  ${safe(content.body ?? "")}
                                </div>
                              </div>
                            `,
                          )
                          .join("")
                      : "—"
                  }
                </td>
              </tr>
            `,
          )
          .join("")
      : `
          <tr>
            <td colspan="3">—</td>
          </tr>
        `
  }
</tbody>
    </table>
    ${subsectionHeading("B", "Peer Perceptions of the Subject Student (As Described by Student)")}
    ${numberedList(session.peerPerceptions)}
    ${subsectionHeading("C", "Group Coping Strategy (Student's Explanation of Class Behavior)")}
    ${numberedList(session.groupObservations)}
  `;
}

export function renderObjectiveFindingsSection(session: SessionData) {
  return `
    ${sectionHeading("3", "Objective Findings & Psychological Assessment")}
    <table class="assessment-table">
      <thead>
        <tr>
          <th>
            OBJECTIVE FINDINGS (Counselor Analysis)
          </th>
          <th>
            RISK &amp; PSYCHOLOGICAL STATUS
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            ${
              session.objectiveFindings?.length
                ? session.objectiveFindings
                    .map(
                      (finding, index) => `
                        <div class="assessment-item">
                          <div class="assessment-title">
                            (${index + 1})
                            ${safe(finding.title)}
                          </div>
                          <div class="assessment-body">
                            ${safe(finding.body)}
                          </div>

                        </div>
                      `,
                    )
                    .join("")
                : "—"
            }
          </td>
          <td>
            ${
              session.riskAssessments?.length
                ? session.riskAssessments
                    .map(
                      (risk, index) => `
                        <div class="assessment-item">
                          <div class="risk-title">
                            (${index + 1})
                            ${safe(risk.riskDimension?.name)}
                            ${risk.subjectLabel ? ` (${safe(risk.subjectLabel)})` : ""}
                          </div>
                          <div class="risk-body">
                            ${riskLevel(String(risk.riskLevel ?? "—"))}
                            ${safe(risk.justification)}
                          </div>

                        </div>
                      `,
                    )
                    .join("")
                : "—"
            }
          </td>
        </tr>
      </tbody>
    </table>
  `;
}

export function renderActionPlanSection(session: SessionData) {
  return `
    ${sectionHeading("4", "Action Plan & Needs for Supervision")}
    ${calloutStart("Recommended Action Items for Leadership & Staff")}
    <div class="action-list">
      ${
        session.actionItems?.length
          ? session.actionItems
              .map(
                (action, index) => `
                  <div class="action-item">
                    <div class="action-title">
                      (${index + 1})
                      ${safe(action.title)}
                      ${action.owner ? ` (${safe(action.owner)})` : ""}
                    </div>
                    <div class="action-body">
                      ${safe(action.body)}
                    </div>
                  </div>
                `,
              )
              .join("")
          : `<div>—</div>`
      }
    </div>
    ${calloutEnd()}
    ${
      session.note?.actionTaken
        ? `
          <div class="assessment-item">
            <div class="assessment-title">Overall Action Taken</div>
            <div class="assessment-body">${safe(session.note.actionTaken)}</div>
          </div>
        `
        : ""
    }
  `;
}

export function renderSummarySection(
  session: SessionData,
  counselorName: string,
) {
  return `
    ${sectionHeading("5", "Counselor's Overall Summary & Synthesis")}
    <div class="summary-box">
      <div class="summary-title">
        Clinical Summary &amp; Overarching Counselor Analysis
      </div>
      <div class="summary-item">
        <div class="summary-label">
          Context &amp; Core Conflict
        </div>
        <div class="summary-body">
          ${safe(session.note?.summaryContext)}
        </div>
      </div>
      <div class="summary-item">
        <div class="summary-label">
          Peer Dynamic &amp; Social Health
        </div>
        <div class="summary-body">
          ${safe(session.note?.summaryPeerDynamic)}
        </div>
      </div>
      <div class="summary-item">
        <div class="summary-label">
          Key Conclusion &amp; Pathway Forward
        </div>
        <div class="summary-body">
          ${safe(session.note?.summaryConclusion)}
        </div>
      </div>
      ${
        session.note?.followUpNotes
          ? `
            <div class="summary-item">
              <div class="summary-label">Follow-Up Notes</div>
              <div class="summary-body">${safe(session.note.followUpNotes)}</div>
            </div>
          `
          : ""
      }
    </div>
    <div class="signature-area">
      <div class="signature-line"></div>
      <div class="signature-role">
        School Counselor
      </div>
      <div class="signature-name">
        ${safe(counselorName)}
      </div>
    </div>
  `;
}

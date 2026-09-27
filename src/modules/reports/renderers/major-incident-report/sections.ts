import {
  displayValue,
  formatDateShort,
  formatDateTime,
} from "@/modules/reports/renderers/shared/format";
import { esc } from "@/modules/reports/renderers/shared/html";
import type { gatherMajorIncidentData } from "@/modules/reports/report-query.service";

export type IncidentData = Awaited<ReturnType<typeof gatherMajorIncidentData>>;

export function checkItem(checked: boolean, label: string) {
  return `
    <span class="check-item">
      <span class="check-mark">
        ${checked ? "[X]" : "[ ]"}
      </span>
      <span class="check-label">
        ${esc(label)}
      </span>
    </span>
  `;
}

export function fieldRow(label: string, fieldValue?: unknown) {
  return `
    <div class="field-row">
      <div class="field-label">
        ${esc(label)}
      </div>
      <div class="field-colon">
        :
      </div>
      <div class="field-value">
        ${displayValue(fieldValue)}
      </div>
    </div>
  `;
}

export function sectionTitle(number: string, title: string, italic = false) {
  return `
    <div class="section-title">
      <span class="section-number">
        ${esc(number)}.
      </span>
      <span class="section-text ${italic ? "italic" : ""}">
        ${esc(title)}
      </span>
    </div>
  `;
}

export function renderDocumentHeader() {
  return `
    <div class="document-header">
      <div class="header-icon"></div>
      <div class="header-title">
        SECTION B: MAJOR INCIDENT REPORT FORM
      </div>
    </div>
    <div class="confidential">
      [STRICTLY CONFIDENTIAL]
    </div>
  `;
}

export function renderMetaSection(params: {
  reportNumber: string;
  incidentDate: Date;
  incidentTime: string | null;
  location: string | null;
  reportedByName?: string;
  counselorCalled: string;
  arrivalTime: string;
}) {
  return `
    ${sectionTitle("1", "REPORT METADATA")}
    <div class="metadata-table">
      ${fieldRow("Report ID", params.reportNumber)}
      ${fieldRow("Date", formatDateShort(params.incidentDate))}
      ${fieldRow("Time", params.incidentTime)}
      ${fieldRow("Location", params.location)}
      ${fieldRow("Reporting Staff Member - Role", params.reportedByName)}
      ${fieldRow("Counselor/Admin Called", params.counselorCalled)}
      ${fieldRow("Arrival Time", params.arrivalTime)}
    </div>
  `;
}

export function renderIndividualsSection(params: {
  primaryStudentName: string;
  gradeSection: string;
  primaryRole: string;
  otherStudentsWitnesses: string;
}) {
  return `
    ${sectionTitle("2", "INDIVIDUAL(S) INVOLVED")}
    <div class="individual-table">
      ${fieldRow("Primary Student Name", params.primaryStudentName)}
      ${fieldRow("Grade/Section - ID", params.gradeSection)}
      ${fieldRow("Role", params.primaryRole)}
      <div class="field-row tall-row">
        <div class="field-label">
          Other Students / Witnesses Present
        </div>
        <div class="field-colon">
          :
        </div>
        <div class="field-value">
          ${displayValue(params.otherStudentsWitnesses)}
        </div>
      </div>
    </div>
  `;
}

export function renderCategorySection(selectedCategories: Set<string>) {
  const category = (name: string) =>
    checkItem(selectedCategories.has(name), name);

  return `
    ${sectionTitle("3", "INCIDENT CATEGORY")}
    <div class="category-box">
      <div class="category-column">
        ${category("Physical Aggression / Fighting")}
        ${category("Bullying / Intimidation / Threat")}
        ${category("Targeted Verbal Abuse / Slurs")}
        ${category("Vandalism / Property Damage")}
      </div>
      <div class="category-column">
        ${category("Elopement")}
        ${category("Possession of Prohibited Items / Weapons")}
        ${category("Chronic Minor")}
        ${category("Other")}
      </div>
    </div>
  `;
}

export function renderNarrativeSection(narrative: IncidentData["narrative"]) {
  return `
    ${sectionTitle("4", "FACTUAL DESCRIPTION OF INCIDENT")}
    <div class="antecedent-box">
      <div class="description-label">
        Antecedent (What happened right before?)
      </div>
      <div class="description-value">
        ${displayValue(narrative?.antecedent)}
      </div>
    </div>
     <div class="behavior-impact-box">
      <div class="description-field behavior-field">
        <div class="description-label">
          Behavior (Exact observable actions and words used)
        </div>
        <div class="description-value">
          ${displayValue(narrative?.behavior)}
        </div>
      </div>
      <div class="description-field impact-field">
        <div class="description-label">
          Impact (Interruption to instruction, safety hazard, injury)
        </div>
        <div class="description-value">
          ${displayValue(narrative?.impact)}
        </div>
      </div>
    </div>
  `;
}

export function renderActionSection(response: IncidentData["response"]) {
  return `
    ${sectionTitle("5", "IMMEDIATE ACTION TAKEN ON-SITE")}
    <div class="action-box">
      <div class="action-column">
        ${checkItem(
          !!response?.studentEscortedToOffice,
          "Student escorted to Office / Counselor Room",
        )}
        ${checkItem(
          !!response?.firstAidOrNurseRequested,
          "First Aid / Nurse requested",
        )}
        ${checkItem(
          !!response?.onsiteDeescalationByCounselor,
          "On-site de-escalation by Counselor",
        )}
      </div>
      <div class="action-column">
        ${checkItem(
          !!response?.classroomEvacuated,
          "Classroom temporarily evacuated",
        )}
        ${checkItem(!!response?.additionalAction, "Other:")}
        ${
          response?.additionalAction
            ? `
              <div class="other-action">
                ${displayValue(response.additionalAction)}
              </div>
            `
            : ""
        }
      </div>
    </div>
  `;
}

export function renderFollowUpSection(params: {
  parentContacted: boolean;
  parentContactDate: Date | null;
  parentContactedBy: string;
  parentContactMethod: string;
  parentActionSupportPlan: string;
}) {
  return `
    ${sectionTitle("6", "FOLLOW-UP & PARENT LOG", true)}
    <div class="parent-log">
      <div class="parent-contact-row">
        <div class="parent-label">
          Parent Contacted?
        </div>
        <div class="parent-colon">
          :
        </div>
        <div class="parent-value">
          ${checkItem(params.parentContacted === true, "Yes")}
          ${checkItem(params.parentContacted === false, "No")}
        </div>
      </div>
      ${fieldRow("Date/Time", formatDateTime(params.parentContactDate))}
      ${fieldRow("Contacted By", params.parentContactedBy)}
      ${fieldRow("Method", params.parentContactMethod)}
      <div class="field-row parent-plan-row">
        <div class="field-label">
          Action / Support Plan
        </div>
        <div class="field-colon">
          :
        </div>
        <div class="field-value">
          ${displayValue(params.parentActionSupportPlan)}
        </div>
      </div>
    </div>
  `;
}

export function renderSignoffSection(params: {
  reportingStaffSignerName?: string | null;
  counselorSignerName?: string | null;
  leadershipSignerName?: string | null;
  status: string;
}) {
  return `
    <div class="signoff-section">
    ${sectionTitle("7", "SIGN-OFF & CASE STATUS")}
    <div class="signoff-box">
      <div class="signoff-column">
        <div class="signoff-role">
          Reporting Staff
        </div>
        <div class="signoff-line">
          ${displayValue(params.reportingStaffSignerName)}
        </div>
      </div>
      <div class="signoff-column">
        <div class="signoff-role">
          Counselor
        </div>
        <div class="signoff-line">
          ${displayValue(params.counselorSignerName)}
        </div>
      </div>
      <div class="signoff-column">
        <div class="signoff-role">
          School Leadership
        </div>
        <div class="signoff-line">
          ${displayValue(params.leadershipSignerName)}
        </div>
      </div>
    </div>
    <div class="status-box">
      <span class="status-label">
        STATUS
      </span>
      <span class="status-colon">
        :
      </span>
      ${checkItem(params.status === "UNDER_INVESTIGATION", "Under Investigation")}
      ${checkItem(params.status === "SUPPORT_PLAN_ACTIVE", "Support Plan Active")}
      ${checkItem(
        params.status === "RESOLVED" || params.status === "CLOSED",
        "Resolved / Case Closed",
      )}
    </div>
    </div>
  `;
}

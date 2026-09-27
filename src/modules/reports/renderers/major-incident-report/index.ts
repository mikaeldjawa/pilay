import {
  type IncidentData,
  renderActionSection,
  renderCategorySection,
  renderDocumentHeader,
  renderFollowUpSection,
  renderIndividualsSection,
  renderMetaSection,
  renderNarrativeSection,
  renderSignoffSection,
} from "@/modules/reports/renderers/major-incident-report/sections";
import { MAJOR_INCIDENT_CSS } from "@/modules/reports/renderers/major-incident-report/styles";
import { formatDateTime } from "@/modules/reports/renderers/shared/format";
import { reportDocument } from "@/modules/reports/renderers/shared/report-document";
import { formatStudentName } from "@/lib/utils";

type SignoffRole = "REPORTING_STAFF" | "COUNSELOR" | "LEADERSHIP";

// Everything the major incident report renders below its own `<style>` tag
// — extracted so a merged multi-section student report can embed the exact
// same template content without a second, conflicting `reportDocument()`
// (and therefore `<html>`/`<head>`) wrapper.
export function renderMajorIncidentBody(params: {
  incident: IncidentData;
  reportNumber: string;
}) {
  const { incident, reportNumber } = params;
  const primaryParticipant = incident.participants?.[0];

  const primaryStudentName = primaryParticipant
    ? formatStudentName(primaryParticipant.student)
    : "";

  const primaryRole = primaryParticipant?.involvementType ?? "";

  const otherParticipants = (incident.participants ?? []).slice(1);

  const otherParticipantNames = otherParticipants
    .map((participant) => formatStudentName(participant.student))
    .filter(Boolean);

  const witnessNames = (incident.witnesses ?? [])
    .map((witness) => {
      const role = witness.role ? ` (${witness.role})` : "";
      return `${witness.name}${role}`;
    })
    .filter(Boolean);

  const otherStudentsWitnesses = [
    ...otherParticipantNames,
    ...witnessNames,
  ].join(", ");

  const selectedCategories = new Set(
    (incident.categorySelections ?? []).map(
      (item) => item.incidentCategory.name,
    ),
  );

  const signoffByRole = (role: SignoffRole) =>
    incident.signoffs?.find((signoff) => signoff.role === role);

  const reportingStaffSignoff = signoffByRole("REPORTING_STAFF");
  const counselorSignoff = signoffByRole("COUNSELOR");
  const leadershipSignoff = signoffByRole("LEADERSHIP");
  const parentContactList = incident.parentContacts ?? [];
  const parentLog = parentContactList[0];
  const parentContacted = parentContactList.length > 0;
  const parentContactDate = parentLog?.contactDate ?? null;
  const parentContactedBy = parentLog?.guardian?.fullName ?? "";
  const parentContactMethod = parentLog?.method ?? "";
  const parentActionSupportPlan =
    parentLog?.outcome ?? incident.supportPlan ?? "";

  const counselorCalled = formatDateTime(incident.counselorOrAdminCalledAt);
  const arrivalTime = "";

  const primaryEnrollment = primaryParticipant?.student?.enrollments?.[0];
  const gradeSection = primaryEnrollment
    ? `${primaryEnrollment.grade.name} / ${primaryEnrollment.class.name}`
    : "";

  return `
    <div class="page">
      ${renderDocumentHeader()}
      ${renderMetaSection({
        reportNumber,
        incidentDate: incident.incidentDate,
        incidentTime: incident.incidentTime,
        location: incident.location,
        reportedByName: incident.reportedBy?.fullName,
        counselorCalled,
        arrivalTime,
      })}
      ${renderIndividualsSection({
        primaryStudentName,
        gradeSection,
        primaryRole,
        otherStudentsWitnesses,
      })}
      ${renderCategorySection(selectedCategories)}
      ${renderNarrativeSection(incident.narrative)}
      ${renderActionSection(incident.response)}
      ${renderFollowUpSection({
        parentContacted,
        parentContactDate,
        parentContactedBy,
        parentContactMethod,
        parentActionSupportPlan,
      })}
      ${renderSignoffSection({
        reportingStaffSignerName: reportingStaffSignoff?.signerName,
        counselorSignerName: counselorSignoff?.signerName,
        leadershipSignerName: leadershipSignoff?.signerName,
        status: incident.status,
      })}
    </div>
  `;
}

export function renderMajorIncidentReport(params: {
  incident: IncidentData;
  reportNumber: string;
}) {
  const body = `
    <style>${MAJOR_INCIDENT_CSS}</style>

    ${renderMajorIncidentBody(params)}
  `;

  return reportDocument({
    title: `Major Incident Report ${params.reportNumber}`,
    body,
  });
}

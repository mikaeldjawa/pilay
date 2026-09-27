import { formatDateLong, formatDateShort } from "@/modules/reports/renderers/shared/format";
import { esc } from "@/modules/reports/renderers/shared/html";
import { formatStudentName } from "@/lib/utils";
import type { gatherStudentFullReportData } from "@/modules/reports/report-query.service";

export type StudentFullReportData = Awaited<ReturnType<typeof gatherStudentFullReportData>>;

// Whole years between a date of birth and a reference date. Returns "" when no
// DOB is on file so the profile row can fall back to an em-dash.
function computeAge(dateOfBirth: Date | null, asOf: Date): string {
  if (!dateOfBirth) return "";
  let age = asOf.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = asOf.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && asOf.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age >= 0 ? `${age} yrs` : "";
}

function profileRow(label: string, value: string) {
  return `
    <div class="profile-row">
      <div class="profile-label">${esc(label)}</div>
      <div class="profile-value">${value || "—"}</div>
    </div>
  `;
}

export function renderCoverPage(params: {
  data: StudentFullReportData;
  reportNumber: string;
  generatedAt: Date;
  schoolName: string;
}) {
  const { data, reportNumber, generatedAt, schoolName } = params;
  const { student } = data;
  const enrollment = student.enrollments[0];
  const fullName = formatStudentName(student) || student.studentId;
  const statusLabel = student.status
    ? student.status.charAt(0) + student.status.slice(1).toLowerCase()
    : "—";

  const guardianRows = student.guardians.length
    ? student.guardians
        .map((link) => {
          const roles = [
            link.isPrimaryContact ? "Primary" : "",
            link.isEmergencyContact ? "Emergency" : "",
          ]
            .filter(Boolean)
            .join(" · ");
          return `
            <tr>
              <td>${esc(link.guardian.fullName)}</td>
              <td>${esc(link.guardian.relationship) || "—"}</td>
              <td>${esc(link.guardian.phone) || "—"}</td>
              <td>${roles || "—"}</td>
            </tr>
          `;
        })
        .join("")
    : `<tr><td colspan="4" class="empty-note">No guardian or emergency contact on file.</td></tr>`;

  return `
    <div class="cover-page">
      <div class="cover-header">
        <div class="cover-school">${esc(schoolName)}</div>
        <div class="cover-classification">Confidential — Student Record</div>
      </div>

      <div class="cover-title">Student Full Report</div>
      <div class="cover-subtitle">Consolidated counseling, incident, and behavior record</div>

      <div class="cover-identity">
        <div class="cover-identity-name">${esc(fullName)}</div>
        <div class="cover-identity-id">Student ID: ${esc(student.studentId)}</div>
        <span class="status-pill status-${esc(student.status.toLowerCase())}">${esc(statusLabel)}</span>
      </div>

      <div class="section-label">Student Profile</div>
      <div class="profile-grid">
        ${profileRow("Full Name", esc(fullName))}
        ${profileRow("Date of Birth", student.dateOfBirth ? esc(formatDateLong(student.dateOfBirth)) : "")}
        ${profileRow("Age", esc(computeAge(student.dateOfBirth, generatedAt)))}
        ${profileRow("Gender", esc(student.gender))}
        ${profileRow("Grade", enrollment ? esc(enrollment.grade.name) : "")}
        ${profileRow("Class", enrollment ? esc(enrollment.class.name) : "")}
        ${profileRow("Homeroom Teacher", enrollment ? esc(enrollment.class.homeroomTeacher) : "")}
        ${profileRow("Enrollment Status", esc(statusLabel))}
      </div>

      <div class="section-label">Guardians &amp; Emergency Contacts</div>
      <table class="guardian-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Relationship</th>
            <th>Phone</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          ${guardianRows}
        </tbody>
      </table>

      <div class="section-label">Contents &amp; Record Counts</div>
      <ol class="cover-toc">
        <li><span>1. Counseling Session Reports</span><span class="toc-count">${data.counselingSessions.length}</span></li>
        <li><span>2. Major Incident Reports</span><span class="toc-count">${data.incidents.length}</span></li>
        <li><span>3. Minor Behavior Log (entries)</span><span class="toc-count">${data.behaviorRows.length}</span></li>
      </ol>

      <p class="cover-note">Each section below reproduces its official report template in full, in the order listed above.</p>

      <div class="cover-footer-grid">
        ${profileRow("Report Number", esc(reportNumber))}
        ${profileRow("Date Generated", esc(formatDateShort(generatedAt)))}
        ${profileRow("Prepared By", esc(schoolName))}
        ${profileRow("Classification", "Confidential — For authorized personnel only")}
      </div>

      <div class="cover-privacy">
        <strong>PRIVACY NOTICE:</strong>
        <em>This report contains confidential student information intended strictly for authorized school personnel. Unauthorized access, sharing, or reproduction is prohibited.</em>
      </div>
    </div>
  `;
}

export function renderSectionDivider(title: string) {
  return `<div class="section-divider-title">${esc(title)}</div>`;
}

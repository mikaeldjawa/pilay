import { formatDateShort } from "@/modules/reports/renderers/shared/format";
import { esc } from "@/modules/reports/renderers/shared/html";
import { formatStudentName } from "@/lib/utils";
import type { gatherMinorBehaviorLogData } from "@/modules/reports/report-query.service";

export type Rows = Awaited<ReturnType<typeof gatherMinorBehaviorLogData>>;

export function renderFormHeader() {
  return `
    <div class="form-title">
      <div class="form-title-inner">
        <span class="title-icon"></span>
        <span class="form-title-text">
          SECTION A: MINOR INCIDENT TICK-AND-GO GRID
        </span>
      </div>
    </div>
  `;
}

export function renderCodeLegend() {
  const behaviorCodeRows = `
    <table class="code-table behavior-code-table">
      <tbody>
        <tr>
          <td class="code">[D]</td>
          <td>Disruption/Noise</td>
          <td class="code">[P]</td>
          <td>Rough Play</td>
        </tr>
        <tr>
          <td class="code">[N]</td>
          <td>Non-Compliance</td>
          <td class="code">[M]</td>
          <td>Misuse of Items</td>
        </tr>
        <tr>
          <td class="code">[L]</td>
          <td>Language</td>
          <td class="code">[T]</td>
          <td>Tech Misuse</td>
        </tr>
      </tbody>
    </table>
  `;

  const actionCodeRows = `
    <table class="code-table action-code-table">
      <tbody>
        <tr>
          <td class="code">[W]</td>
          <td>Verbal Warning</td>

          <td class="code">[R]</td>
          <td>Restorative Talk</td>
        </tr>

        <tr>
          <td class="code">[S]</td>
          <td>Seat Change</td>

          <td class="code">[E]</td>
          <td>Escalated (3+)</td>
        </tr>

        <tr>
          <td class="code">[C]</td>
          <td>Cooling-off Break</td>
        </tr>
      </tbody>
    </table>
  `;

  return `
    <div class="code-section">

      <div class="code-box behavior-box">
        <div class="code-heading">
          BEHAVIOR CODES:
        </div>
        ${behaviorCodeRows}
      </div>
      <div class="code-box action-box">
        <div class="code-heading">
          ACTION CODES:
        </div>
        ${actionCodeRows}
      </div>
    </div>
  `;
}

export function renderMetaRow(params: {
  dateFrom: Date;
  dateTo: Date;
  classroomReference?: string;
  className?: string;
  reportNumber: string;
}) {
  const roomLine = [params.className, params.classroomReference].filter(Boolean).join(" · ");
  return `
    <div class="meta-row">
      <div class="meta-item">
        <span class="meta-label">
          Date Range:
        </span>
        <span class="meta-line">
          ${esc(formatDateShort(params.dateFrom))} – ${esc(formatDateShort(params.dateTo))}
        </span>
      </div>
      <div class="meta-item">
        <span class="meta-label">
          Class / Room #:
        </span>
        <span class="meta-line">
          ${esc(roomLine)}
        </span>
      </div>
      <div class="meta-item">
        <span class="meta-label">
          Page Number: M-
        </span>
        <span class="meta-line page-number">
          ${esc(params.reportNumber)}
        </span>
      </div>
    </div>
  `;
}

export function renderRecordsTable(rows: Rows) {
  const tableRows = rows
    .map((row, index) => {
      const record = row.record;

      const studentName = record.student ? formatStudentName(record.student) : "";

      const behaviorCode = [
        ...record.categories.map((c) => c.behaviorCategory.code ?? c.behaviorCategory.name),
        record.otherBehaviorText,
      ]
        .filter(Boolean)
        .join(", ");
      const actionCode = [
        ...record.actions.map((a) => a.actionCode.code ?? a.actionCode.name),
        record.otherActionText,
      ]
        .filter(Boolean)
        .join(", ");
      const count = row.chronicCount ?? 0;

      const countHtml = `
      <span class="${count >= 1 ? "count-active" : ""}">1</span> ·
      <span class="${count >= 2 ? "count-active" : ""}">2</span> ·
      <span class="${count >= 3 ? "count-active count-chronic" : ""}">3+</span>
    `;

      const teacherStaff = record.recordedBy?.fullName ?? "";

      return `
      <tr class="log-row">
        <td class="row-number">
          ${index + 1}
        </td>
        <td class="date-time-cell">
          ${esc(formatDateShort(record.recordDate))}
          <br />
          <span class="time">
            ${esc(record.recordTime ?? "")}
          </span>
        </td>
        <td class="student-cell">
          ${esc(studentName)}
        </td>
        <td class="behavior-cell">
          ${esc(behaviorCode)}
        </td>
        <td class="action-cell">
          ${esc(actionCode)}
        </td>
        <td class="count-cell">
          ${countHtml}
        </td>
        <td class="teacher-cell">
          ${esc(teacherStaff)}
        </td>
        <td class="note-cell">
          ${esc(record.description ?? "")}
        </td>
      </tr>
    `;
    })
    .join("");

  return `
    <table class="log-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Date &amp; Time</th>
          <th>Student Name</th>
          <th>Behavior</th>
          <th>Action</th>
          <th>Count</th>
          <th>Teacher/Staff</th>
          <th>Brief Note (Optional)</th>
        </tr>
      </thead>
      <tbody>
        ${
          rows.length > 0
            ? tableRows
            : `<tr><td class="empty-row" colspan="8">No minor behavior records found for this date range.</td></tr>`
        }
      </tbody>
    </table>
  `;
}

export function renderChronicRuleNote() {
  return `
    <div class="chronic-rule">
      <span class="chronic-warning">⚠</span>
      <span class="chronic-title">
        CHRONIC MINOR RULE:
      </span>
      <span class="chronic-text">
        If a student hits 3+ for the same behavior within two weeks,
        circle (E) under Action Code, notify the Counselor during Friday
        audit, and initiate Tier 2 support.
      </span>
    </div>
  `;
}

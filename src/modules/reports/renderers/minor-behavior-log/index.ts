import { reportDocument } from "@/modules/reports/renderers/shared/report-document";
import { MINOR_BEHAVIOR_LOG_CSS } from "@/modules/reports/renderers/minor-behavior-log/styles";
import {
  type Rows,
  renderFormHeader,
  renderCodeLegend,
  renderMetaRow,
  renderRecordsTable,
  renderChronicRuleNote,
} from "@/modules/reports/renderers/minor-behavior-log/sections";

export function renderMinorBehaviorLog(params: {
  rows: Rows;
  reportNumber: string;
  dateFrom: Date;
  dateTo: Date;
  classroomReference?: string;
  className?: string;
}) {
  const { rows, reportNumber, dateFrom, dateTo, classroomReference, className } = params;
  const body = `
    <style>${MINOR_BEHAVIOR_LOG_CSS}</style>
    <div class="form">
      ${renderFormHeader()}
      ${renderCodeLegend()}
      ${renderMetaRow({ dateFrom, dateTo, classroomReference, className, reportNumber })}
      ${renderRecordsTable(rows)}
      ${renderChronicRuleNote()}
    </div>
  `;
  return reportDocument({
    title: `Minor Incident Tick-and-Go Grid ${reportNumber}`,
    landscape: true,
    body,
  });
}

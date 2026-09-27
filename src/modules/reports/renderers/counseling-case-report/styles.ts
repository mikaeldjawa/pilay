const COLORS = {
  blue: "#00658F",
  blueDark: "#005B82",
  cyan: "#D4F1F5",
  cyanLight: "#EDF8FA",
  cream: "#FFF8E8",
  lightBlue: "#EEF7FA",
  border: "#006FA3",
  black: "#111111",
  red: "#FF0000",
};

export const COUNSELING_CASE_CSS = `
  * {
    box-sizing: border-box;
  }

  body {
    font-family: Arial, Helvetica, sans-serif;
    color: ${COLORS.black};
    font-size: 10.5pt;
    line-height: 1.42;

    /* Padding just for preiew
    padding:50px;
    */
  }

  .report-page {
    width: 100%;
  }

  .privacy-notice {
    margin: 0 0 20px 0;
    font-size: 10.5pt;
    line-height: 1.45;
    text-align: left;
  }

  .privacy-notice strong {
    color: ${COLORS.red};
    font-weight: 700;
  }

  .document-title {
    margin: 0 0 26px 0;
    text-align: center;
    color: ${COLORS.blue};
    font-size: 18pt;
    line-height: 1.15;
    font-weight: 700;
    text-transform: uppercase;
  }

  .detail-row {
   display: flex;
   justify-content: space-between;
  }

  .detail-label {
    width: 50%;
    background: ${COLORS.cyan};
    padding: 6px 12px;
  }

  .detail-value {
    width: 100%;
    padding: 6px 12px;
    background: antiquewhite;
    border-bottom: 1.5px solid ${COLORS.black};
  }

  .report-meta {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 42px 0;
    border-top: 1px solid ${COLORS.black};
    border-bottom: 1px solid ${COLORS.black};
  }

  .report-meta-row {
    display: table-row;
  }

  .report-meta-label {
    display: table-cell;
    width: 31%;
    padding: 6px 9px;
    background: ${COLORS.cyan};
    color: ${COLORS.blue};
    font-weight: 700;
    vertical-align: top;
    border-bottom: 1px solid ${COLORS.black};
  }

  .report-meta-value {
    display: table-cell;
    padding: 6px 9px;
    background: ${COLORS.cream};
    vertical-align: top;
    border-bottom: 1px solid ${COLORS.black};
  }

  .meta-bottom-bar {
    height: 30px;
    background: ${COLORS.blueDark};
  }

  .glance-title {
    color: ${COLORS.blue};
    font-size: 14pt;
    font-weight: 700;
    margin: 0 0 0 0;
    text-transform: uppercase;
  }

  .glance-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 25px;
  }

  .glance-row {
    display: flex;
    border-top: 1px solid ${COLORS.black};
  }

  .glance-row:last-child {
    border-bottom: 1px solid ${COLORS.black};
  }

  .glance-label {
    width: 36%;
    background: ${COLORS.cyan};
    color: ${COLORS.blue};
    font-weight: 700;
    padding: 4px 8px;
    vertical-align: top;
  }

  .glance-separator {
    width: 2%;
    text-align: center;
    font-weight: 700;
    padding: 4px 0;
    vertical-align: top;
  }

  .glance-value {
    width: 60%;
    padding: 4px 8px;
    vertical-align: top;
  }

  .section-heading {
    display: flex;
    align-items: baseline;
    gap: 8px;
    color: ${COLORS.blue};
    font-size: 14pt;
    font-weight: 700;
    text-transform: uppercase;
    border-bottom: 3px solid ${COLORS.blue};
    padding-bottom: 7px;
    margin: 22px 0 12px 0;
    page-break-after: avoid;
  }

  .section-number {
    flex: 0 0 auto;
  }

  .subsection-heading {
    display: flex;
    gap: 7px;
    color: ${COLORS.blue};
    font-size: 12pt;
    font-weight: 700;
    margin: 14px 0 5px 30px;
    page-break-after: avoid;
  }

  .presentation-block {
    margin-left: 12px;
  }

  .presentation-item {
    margin-bottom: 9px;
  }

  .presentation-title {
    color: ${COLORS.blue};
    font-weight: 700;
    margin-bottom: 2px;
  }

  .presentation-body {
    margin-left: 29px;
    text-align: justify;
  }

  .numbered-list {
    margin: 0;
  }

  .numbered-item {
    margin: 5px 0 8px 0;
    page-break-inside: avoid;
  }

  .numbered-title {
    margin-left: 29px;
    color: ${COLORS.blue};
    font-weight: 700;
  }

  .numbered-body {
    margin-left: 52px;
    margin-top: 2px;
    text-align: justify;
  }

  .empty-value {
    margin-left: 30px;
  }

  .callout {
    border: 3px solid ${COLORS.border};
    background: ${COLORS.lightBlue};
    padding: 16px 18px;
    margin: 20px 0 20px 0;
    page-break-inside: auto;
  }

  .callout-title {
    text-align: center;
    color: ${COLORS.blue};
    font-size: 12.5pt;
    font-weight: 700;
    margin-bottom: 14px;
    text-transform: uppercase;
  }

  .callout-icon {
    font-size: 15pt;
    margin-right: 5px;
  }

.timeline-content-item + .timeline-content-item {
  margin-top: 8px;
}

.timeline-event-title {
  font-weight: 600;
  margin-bottom: 2px;
}

  .timeline-table {
    width: calc(100% - 42px);
    margin: 10px 0 22px 42px;
    border-collapse: collapse;
    page-break-inside: auto;
  }

  .timeline-table tr {
    page-break-inside: avoid;
  }

  .timeline-table td {
    border: 1px solid #555;
    padding: 7px 9px;
    vertical-align: top;
  }

  .timeline-phase {
    color: ${COLORS.blue};
    width: 28%;
    font-weight: 700;
  }

  .timeline-separator {
    width: 3%;
    text-align: center;
    font-weight: 700;
  }

  .timeline-content {
    width: 69%;
    text-align: justify;
  }

  .timeline-event {
    margin-bottom: 9px;
  }

  .timeline-event:last-child {
    margin-bottom: 0;
  }

  .timeline-event-title {
    font-weight: 700;
  }

  .assessment-table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0 25px 0;
    page-break-inside: avoid;
  }

  .assessment-table th {
    background: ${COLORS.blueDark};
    color: white;
    text-align: left;
    font-size: 11pt;
    padding: 8px 9px;
    border: 1px solid ${COLORS.black};
  }

  .assessment-table td {
    border: 1px solid ${COLORS.black};
    padding: 8px 10px;
    vertical-align: top;
  }

  .assessment-table td:first-child {
    width: 50%;
  }

  .assessment-table td:last-child {
    width: 50%;
  }

  .assessment-item {
    margin-bottom: 11px;
  }

  .assessment-item:last-child {
    margin-bottom: 0;
  }

  .assessment-title {
    color: ${COLORS.blue};
    font-weight: 700;
    margin-bottom: 2px;
  }

  .assessment-body {
    margin-left: 29px;
    text-align: justify;
  }

  .risk-title {
    color: ${COLORS.blue};
    font-weight: 700;
    margin-bottom: 2px;
  }

  .risk-body {
    margin-left: 29px;
    text-align: justify;
  }

  .risk-level {
    font-weight: 800;
    margin-right: 7px;
  }

  .risk-critical {
    color: #C00000;
  }

  .risk-high {
    color: #D26A00;
  }

  .risk-medium {
    color: #A36A00;
  }

  .risk-low {
    color: #397D3C;
  }

  .risk-normal {
    color: ${COLORS.blue};
  }

  .action-list {
    margin: 0;
  }

  .action-item {
    margin-bottom: 12px;
    page-break-inside: avoid;
  }

  .action-title {
    color: ${COLORS.blue};
    font-weight: 700;
  }

  .action-body {
    margin-left: 29px;
    margin-top: 2px;
    text-align: justify;
  }

  .summary-box {
    border: 3px solid ${COLORS.border};
    background: ${COLORS.lightBlue};
    padding: 16px 17px;
    margin-top: 12px;
    page-break-inside: avoid;
  }

  .summary-title {
    color: ${COLORS.blue};
    text-align: center;
    font-size: 12.5pt;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 18px;
  }

  .summary-item {
    margin-bottom: 17px;
  }

  .summary-item:last-child {
    margin-bottom: 0;
  }

  .summary-label {
    color: ${COLORS.blue};
    font-weight: 700;
    margin-bottom: 4px;
  }

  .summary-body {
    text-align: justify;
  }

  .signature-area {
    width: 42%;
    margin-left: auto;
    margin-top: 36px;
    text-align: center;
    page-break-inside: avoid;
    break-inside: avoid;
    /* Keep the signature attached to the summary above it so it never lands
       alone at the top of an otherwise-blank page. */
    page-break-before: avoid;
    break-before: avoid;
  }

  .signature-line {
    border-top: 1px solid ${COLORS.black};
    margin-bottom: 4px;
  }

  .signature-role {
    font-weight: 700;
    color: ${COLORS.blue};
  }

  .signature-name {
    font-weight: 700;
    color: ${COLORS.blue};
  }

  .keep-together {
    page-break-inside: avoid;
  }

  .page-break-before {
    page-break-before: always;
  }

  table {
    page-break-inside: auto;
  }

  tr,
  img {
    page-break-inside: avoid;
  }

  h1,
  h2,
  h3,
  h4 {
    page-break-after: avoid;
  }

  p {
    margin-top: 0;
    margin-bottom: 8px;
  }
`;

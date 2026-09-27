export const MINOR_BEHAVIOR_LOG_CSS = `
  @page {
    size: A4 landscape;
  }

  * {
    box-sizing: border-box;
  }

  body {
    font-family: Arial, Helvetica, sans-serif;
    color: #111;
    font-size: 10px;
  }

  .form-title {
    width: 100%;
    text-align: center;
    margin: 0 0 10px 0;
  }

  .form-title-inner {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .title-icon {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background:
      repeating-linear-gradient(
        135deg,
        #00a651 0px,
        #00a651 2px,
        #ffffff 2px,
        #ffffff 4px
      );
    border: 2px solid #00a651;
    display: inline-block;
  }

  .form-title-text {
    color: #008f45;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.2px;
  }

  .code-section {
    display: flex;
    width: 100%;
    gap: 38px;
    margin-bottom: 14px;
  }

  .code-box {
    flex: 1;
  }

  .code-box.behavior-box {
    width: 52%;
  }

  .code-box.action-box {
    width: 48%;
  }

  .code-heading {
    background: #e8f2df;
    border: 1px solid #d7e5cd;
    border-bottom: 0;
    padding: 5px 10px;
    font-size: 11px;
    font-weight: 700;
  }

  .code-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    font-size: 10px;
  }

  .code-table td {
    border: 1px solid #777;
    height: 20px;
    padding: 2px 8px;
    vertical-align: middle;
  }

  .code-table .code {
    width: 42px;
    font-weight: 700;
    text-align: center;
    padding: 2px 3px;
  }

  .behavior-code-table td:nth-child(2) {
    width: 45%;
  }

  .behavior-code-table td:nth-child(4) {
    width: 45%;
  }

  .action-code-table td:nth-child(2) {
    width: 42%;
  }

  .action-code-table td:nth-child(4) {
    width: 42%;
  }

  .empty-cell {
    border-color: #777;
  }

  .meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 0 16px 0;
    padding: 0 38px;
    font-size: 11px;
  }

  .meta-item {
    display: flex;
    align-items: baseline;
    gap: 5px;
  }

  .meta-label {
    font-weight: 400;
  }

  .meta-line {
    display: inline-block;
    min-width: 150px;
    border-bottom: 1px solid #111;
    height: 15px;
  }

  .meta-line.page-number {
    min-width: 75px;
  }

  .log-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    margin: 0;
  }

  .log-table th,
  .log-table td {
    border: 1px solid #777;
  }

  .log-table thead th {
    background: #edf1f2;
    height: 29px;
    padding: 4px 5px;
    font-size: 10px;
    font-weight: 700;
    text-align: center;
    vertical-align: middle;
  }

  .log-table tbody td {
    height: 36px;
    padding: 3px 5px;
    vertical-align: top;
    font-size: 9.5px;
  }

  .log-table th:nth-child(1),
  .log-table td:nth-child(1) {
    width: 3%;
  }

  .log-table th:nth-child(2),
  .log-table td:nth-child(2) {
    width: 17%;
  }

  .log-table th:nth-child(3),
  .log-table td:nth-child(3) {
    width: 17%;
  }

  .log-table th:nth-child(4),
  .log-table td:nth-child(4) {
    width: 7%;
  }

  .log-table th:nth-child(5),
  .log-table td:nth-child(5) {
    width: 6%;
  }

  .log-table th:nth-child(6),
  .log-table td:nth-child(6) {
    width: 8%;
  }

  .log-table th:nth-child(7),
  .log-table td:nth-child(7) {
    width: 13%;
  }

  .log-table th:nth-child(8),
  .log-table td:nth-child(8) {
    width: 29%;
  }

  .row-number {
    text-align: center;
    font-weight: 700;
    font-size: 10px !important;
  }

  .date-time-cell {
    text-align: left;
    line-height: 1.25;
  }

  .time {
    color: #444;
  }

  .student-cell {
    font-weight: 500;
  }

  .behavior-cell,
  .action-cell {
    text-align: center;
    font-weight: 700;
  }

  .count-cell {
    text-align: center;
    white-space: nowrap;
    font-size: 9px !important;
    vertical-align: middle !important;
  }

  .count-active {
    font-weight: 700;
  }

  .count-chronic {
    color: #d71920;
  }

  .teacher-cell {
    vertical-align: top;
  }

  .note-cell {
    vertical-align: top;
    text-align: justify;
    word-wrap: break-word;
    overflow-wrap: anywhere;
  }

  .empty-row {
    text-align: center;
    color: #666;
    font-style: italic;
    height: 32px;
  }

  .chronic-rule {
    margin-top: 7px;
    font-size: 9.5px;
    line-height: 1.45;
  }

  .chronic-warning {
    color: #ff1722;
    font-size: 13px;
    font-weight: 700;
  }

  .chronic-title {
    color: #ff1722;
    font-weight: 700;
    font-size: 10px;
  }

  .chronic-text {
    color: #111;
  }

  .form {
    width: 100%;
  }

  tr {
    page-break-inside: avoid;
  }
`;

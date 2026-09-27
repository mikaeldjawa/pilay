export const MAJOR_INCIDENT_CSS = `
  @page {
    size: A4 portrait;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    font-family: Arial, Helvetica, sans-serif;
    color: #000;
    font-size: 10px;
  }

  .page {
    width: 100%;
    position: relative;
  }

  .document-header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .header-icon {
    width: 19px;
    height: 19px;
    flex: 0 0 auto;
    border-radius: 50%;
    background:
      repeating-linear-gradient(
        135deg,
        #ff002b 0px,
        #ff002b 2px,
        #ffffff 2px,
        #ffffff 4px
      );
    border: 1.5px solid #ff002b;
  }

  .header-title {
    color: #ff002b;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.2;
  }

  .confidential {
    text-align: center;
    color: #ff002b;
    font-size: 15px;
    font-weight: 700;
    font-style: italic;
    margin-bottom: 16px;
  }

  .section-title {
    display: flex;
    align-items: baseline;
    gap: 7px;
    color: #004c83;
    font-size: 11px;
    font-weight: 700;
    margin: 0 0 11px 0;
    page-break-after: avoid;
    break-after: avoid;
  }

  .section-number {
    min-width: 12px;
  }

  .section-text {
    letter-spacing: 0.2px;
  }

  .section-text.italic {
    font-style: italic;
  }

  .field-row {
    display: flex;
    width: 100%;
    min-height: 21px;
    border-bottom: 1px solid #000;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .field-label {
    width: 29%;
    background: #08b5c5;
    color: #fff;
    font-weight: 700;
    padding: 4px 7px;
    line-height: 1.25;
  }

  .field-colon {
    width: 4%;
    background: #08b5c5;
    color: #fff;
    text-align: center;
    padding: 4px 2px;
    font-weight: 700;
  }

  .field-value {
    width: 67%;
    background: #d6f2f5;
    min-height: 21px;
    padding: 4px 8px;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }

  .metadata-table {
    width: 100%;
    margin-bottom: 17px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .metadata-table .field-label {
    width: 29%;
  }

  .metadata-table .field-colon {
    width: 3%;
  }

  .metadata-table .field-value {
    width: 68%;
  }

  .individual-table {
    width: 100%;

    margin-bottom: 17px;

    page-break-inside: avoid;
    break-inside: avoid;
  }

  .individual-table .field-label {
    width: 33%;
  }

  .individual-table .field-colon {
    width: 4%;
  }

  .individual-table .field-value {
    width: 63%;
  }

  .tall-row {
    min-height: 74px;
  }

  .tall-row .field-value {
    min-height: 74px;
  }

    .check-item {
      display: flex;
      align-items: baseline;
      width: 100%;
      line-height: 1.35;
    }

    .check-mark {
      display: inline-block;
      width: 32px;
      min-width: 32px;
      max-width: 32px;
      text-align: left;
      font-family: "Courier New", monospace;
      font-weight: bold;
      white-space: nowrap;
      border: none !important;
      background: transparent !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    .check-label {
      flex: 1;
      min-width: 0;
    }

  .category-box {
    width: 100%;
    min-height: 127px;
    background: #d6f2f5;
    display: flex;
    padding: 10px 8px;
    margin-bottom: 16px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .category-column {
    width: 50%;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .antecedent-box {
    width: 100%;
    min-height: 148px;
    background: #d6f2f5;
    padding: 7px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .description-label {
    font-size: 10px;
    line-height: 1.3;
  }

  .description-value {
    text-align: justify;
    margin-top: 5px;
    line-height: 1.4;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .behavior-impact-box {
    width: 100%;
    background: #d6f2f5;
    margin-bottom: 16px;
  }

  .description-field {
    width: 100%;
    padding: 7px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .behavior-field {
    min-height: 158px;
  }

  .impact-field {
    min-height: 158px;
  }

  .action-box {
    width: 100%;
    min-height: 75px;
    background: #d6f2f5;
    display: flex;
    border-bottom: 1px solid #000;
    margin-bottom: 16px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .action-column {
    width: 50%;
    padding: 9px 7px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .action-column + .action-column {
    border-left: 1px solid #000;
  }

  .other-action {
    margin-left: 17px;
    margin-top: -3px;
    max-width: 280px;
    overflow-wrap: anywhere;
  }

  .parent-log {
    width: 100%;
    margin-bottom: 16px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .parent-contact-row {
    display: flex;
    min-height: 50px;
    border-bottom: 1px solid #000;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .parent-label {
    width: 22%;
    background: #d6f2f5;
    font-weight: 700;
    padding: 6px 7px;
  }

  .parent-colon {
    width: 5%;
    background: #d6f2f5;
    text-align: center;
    padding: 6px 2px;
  }

  .parent-value {
    width: 73%;
    background: #d6f2f5;
    padding: 6px 8px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .parent-log .field-label {
    width: 22%;
  }

  .parent-log .field-colon {
    width: 5%;
  }

  .parent-log .field-value {
    width: 73%;
  }

  .parent-plan-row {
    min-height: 49px;
  }

  .notification-note {
    margin-top: 8px;
  }

  /* Keep the whole sign-off section (heading + signatures + status) on one
     page so the signature block never lands alone on an otherwise-blank page. */
  .signoff-section {
    page-break-inside: avoid;
    break-inside: avoid;
    page-break-before: avoid;
    break-before: avoid;
  }

  .signoff-box {
    width: 100%;
    height: 108px;
    background: #ffe6d7;
    display: flex;
    padding: 0 20px;
    margin-bottom: 16px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .signoff-column {
    width: 33.333%;
    position: relative;
    text-align: center;
    padding-top: 7px;
  }

  .signoff-role {
    font-size: 10px;
    margin-bottom: 65px;
  }

  .signoff-line {
    position: absolute;
    left: 17%;
    right: 17%;
    bottom: 27px;
    min-height: 13px;
    border-bottom: 1px solid #000;
    font-size: 9px;
    padding-bottom: 3px;
    overflow: hidden;
  }

  .status-box {
    width: 100%;
    min-height: 26px;
    background: #ffe6d7;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 5px 7px;
    white-space: nowrap;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .status-label {
    font-weight: 400;
  }

  .status-colon {
    margin-left: 18px;
    margin-right: 2px;
  }

  .status-box .check-item {
    gap: 5px;
  }

  @media print {
    html,
    body {
      margin: 0;
      padding: 0;
    }

    .field-row,
    .category-box,
    .antecedent-box,
    .behavior-impact-box,
    .description-field,
    .action-box,
    .parent-log,
    .signoff-box,
    .status-box {
      page-break-inside: avoid;
      break-inside: avoid;
    }
  }
`;

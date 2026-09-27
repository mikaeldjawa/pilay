export const STUDENT_FULL_REPORT_CSS = `
  /* Each top-level report section (counseling group, incident group, minor
     log) starts on a fresh page. */
  .section-break {
    page-break-before: always;
  }

  /* Individual sub-reports break only *between* one another — never before the
     first, so the section divider and the first sub-report share a page rather
     than the divider being stranded alone. */
  .sub-report + .sub-report {
    page-break-before: always;
  }

  /* ---- Cover / student profile page ---- */
  .cover-page {
    color: #1a1a1a;
  }

  .cover-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding-bottom: 2mm;
    margin-bottom: 4mm;
    border-bottom: 2px solid #3538cd;
  }

  .cover-school {
    font-size: 11pt;
    font-weight: 700;
    color: #3538cd;
  }

  .cover-classification {
    font-size: 8pt;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #b42318;
    font-weight: 700;
  }

  .cover-title {
    font-size: 20pt;
    font-weight: 700;
    margin: 0;
    text-align: center;
  }

  .cover-subtitle {
    font-size: 9.5pt;
    color: #666;
    text-align: center;
    margin: 1mm 0 4mm;
  }

  .cover-identity {
    text-align: center;
    padding: 3.5mm;
    margin-bottom: 4mm;
    border: 1px solid #d5d7e5;
    border-radius: 2mm;
    background: #f7f8fc;
  }

  .cover-identity-name {
    font-size: 16pt;
    font-weight: 700;
  }

  .cover-identity-id {
    font-size: 9pt;
    color: #666;
    margin: 1mm 0 2mm;
  }

  .status-pill {
    display: inline-block;
    font-size: 8pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 1mm 3mm;
    border-radius: 6mm;
    background: #e5e7eb;
    color: #374151;
  }

  .status-active {
    background: #dcfce7;
    color: #166534;
  }

  .status-inactive,
  .status-transferred,
  .status-graduated,
  .status-withdrawn {
    background: #fee2e2;
    color: #991b1b;
  }

  .section-label {
    font-size: 9pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #3538cd;
    margin: 2.5mm 0 1.5mm;
    padding-bottom: 1mm;
    border-bottom: 1px solid #d5d7e5;
    page-break-after: avoid;
  }

  .profile-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    border: 1px solid #d5d7e5;
    border-radius: 2mm;
    overflow: hidden;
  }

  .profile-row {
    display: flex;
    padding: 1.4mm 3mm;
    border-bottom: 1px solid #eceef5;
  }

  .profile-grid .profile-row:nth-last-child(-n + 2) {
    border-bottom: none;
  }

  .profile-label {
    flex: 0 0 38%;
    color: #666;
    font-size: 8.5pt;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .profile-value {
    flex: 1;
    font-size: 10pt;
    font-weight: 500;
  }

  .guardian-table {
    width: 100%;
    border-collapse: collapse;
  }

  .guardian-table th,
  .guardian-table td {
    border: 1px solid #d5d7e5;
    padding: 1.5mm 2.5mm;
    text-align: left;
    font-size: 9pt;
  }

  .guardian-table th {
    background: #f2f3f9;
    font-size: 8pt;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: #444;
  }

  .cover-toc {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .cover-toc li {
    display: flex;
    justify-content: space-between;
    padding: 1mm 0;
    border-bottom: 1px dotted #ccc;
    font-size: 10pt;
  }

  .cover-toc li:last-child {
    border-bottom: none;
  }

  .toc-count {
    color: #3538cd;
    font-weight: 700;
  }

  .cover-note {
    font-size: 9pt;
    color: #444;
    margin: 3mm 0;
    line-height: 1.45;
  }

  .cover-footer-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    border: 1px solid #d5d7e5;
    border-radius: 2mm;
    overflow: hidden;
    margin-bottom: 3mm;
  }

  .cover-footer-grid .profile-row {
    border-bottom: 1px solid #eceef5;
  }

  .cover-footer-grid .profile-row:nth-last-child(-n + 2) {
    border-bottom: none;
  }

  .cover-privacy {
    border: 1px solid #f0c9c4;
    border-left: 3px solid #b42318;
    background: #fef6f5;
    border-radius: 1mm;
    padding: 2.5mm 3.5mm;
    font-size: 8.5pt;
    line-height: 1.45;
  }

  .cover-privacy strong {
    color: #b42318;
  }

  /* Keep each cover block whole rather than splitting it across a page
     boundary if the profile ever grows past a single page. */
  .cover-identity,
  .profile-grid,
  .guardian-table,
  .cover-toc,
  .cover-footer-grid,
  .cover-privacy {
    page-break-inside: avoid;
  }

  /* ---- Section dividers between embedded sub-reports ---- */
  .section-divider-title {
    font-size: 15pt;
    font-weight: 700;
    margin: 0 0 5mm;
    padding-bottom: 2mm;
    border-bottom: 2px solid #3538cd;
    color: #3538cd;
  }

  .empty-note {
    color: #666;
    font-style: italic;
  }

  td.empty-note {
    text-align: center;
    padding: 4mm;
  }

  .sub-report-heading {
    font-size: 10.5pt;
    font-weight: 700;
    margin: 6mm 0 2mm;
    color: #3538cd;
  }
`;

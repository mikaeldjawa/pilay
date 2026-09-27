import { esc } from "@/modules/reports/renderers/shared/html";

const PRINT_CSS = `
  * { box-sizing: border-box; }
  body { font-family: 'IBM Plex Sans', Arial, sans-serif; color: #1a1a1a; font-size: 10.5pt; line-height: 1.45; margin: 0; }
  h1 { font-size: 15pt; margin: 0 0 2mm; }
  h2 { font-size: 12pt; margin: 6mm 0 2mm; border-bottom: 1px solid #ccc; padding-bottom: 1mm; }
  h3 { font-size: 10.5pt; margin: 3mm 0 1mm; }
  p { margin: 0 0 2mm; }
  table { width: 100%; border-collapse: collapse; margin: 2mm 0; }
  th, td { border: 1px solid #ccc; padding: 1.5mm 2mm; text-align: left; font-size: 9.5pt; vertical-align: top; }
  th { background: #f2f2f2; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2mm 6mm; margin-bottom: 4mm; }
  .meta-grid .label { color: #666; font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0.02em; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
  ol { padding-left: 5mm; margin: 1mm 0; }
  ol > li { margin-bottom: 1.5mm; }
  .checkbox-list { display: grid; grid-template-columns: 1fr 1fr; gap: 1mm 4mm; }
`;

export function reportDocument(params: {
  title: string;
  landscape?: boolean;
  body: string;
}) {
  const pageSize = params.landscape
    ? "@page { size: A4 landscape; }"
    : "@page { size: A4 portrait; }";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${esc(params.title)}</title>
    <style>${PRINT_CSS}${pageSize}</style>
  </head>
  <body>
    ${params.body}
  </body>
</html>`;
}

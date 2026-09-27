import type { Prisma, ReportType } from "@/generated/prisma/client";

// Highest existing numeric suffix for a given prefix, +1. Deliberately not
// COUNT(*)-based: once any report is deleted (e.g. a failed/test generation
// cleaned up later), COUNT drops below the highest number already in use and
// re-issues a number that collides with an existing row's unique constraint.
function nextSuffix(existingNumbers: string[], prefix: string, digits: number) {
  let max = 0;
  for (const number of existingNumbers) {
    const parsed = parseInt(number.slice(prefix.length), 10);
    if (!Number.isNaN(parsed) && parsed > max) max = parsed;
  }
  return String(max + 1).padStart(digits, "0");
}

// Per-type sequence formats: RPT-YYYY-##### by default, MAJOR-#### for the
// Major Incident Report (matches the physical Incident Logbook's numbering).
export async function nextReportNumber(
  tx: Prisma.TransactionClient,
  reportType: ReportType,
  year: number,
) {
  if (reportType === "INCIDENT_MAJOR") {
    const prefix = "MAJOR-";
    const existing = await tx.generatedReport.findMany({
      where: { reportType, reportNumber: { startsWith: prefix } },
      select: { reportNumber: true },
    });
    const suffix = nextSuffix(existing.map((r) => r.reportNumber), prefix, 4);
    return `${prefix}${suffix}`;
  }

  const prefix = `RPT-${year}-`;
  const existing = await tx.generatedReport.findMany({
    where: { reportNumber: { startsWith: prefix } },
    select: { reportNumber: true },
  });
  const suffix = nextSuffix(existing.map((r) => r.reportNumber), prefix, 5);
  return `${prefix}${suffix}`;
}

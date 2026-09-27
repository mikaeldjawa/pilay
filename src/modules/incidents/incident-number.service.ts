import type { Prisma } from "@/generated/prisma/client";

// Generates INC-YYYY-##### sequenced within the academic year's start year.
// Based on the highest existing numeric suffix, not COUNT(*) — a count drops
// (and re-issues an already-used number) once any incident row is deleted.
export async function nextIncidentNumber(tx: Prisma.TransactionClient, academicYearStartYear: number) {
  const prefix = `INC-${academicYearStartYear}-`;
  const existing = await tx.incident.findMany({
    where: { incidentNumber: { startsWith: prefix } },
    select: { incidentNumber: true },
  });

  let max = 0;
  for (const { incidentNumber } of existing) {
    const parsed = parseInt(incidentNumber.slice(prefix.length), 10);
    if (!Number.isNaN(parsed) && parsed > max) max = parsed;
  }

  return `${prefix}${String(max + 1).padStart(5, "0")}`;
}

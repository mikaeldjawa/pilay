import { db } from "@/lib/db";

// Hard rule: every query here selects only counts/categories/enums — never
// counseling_notes or narrative text columns (PRD §79 privacy-by-design).

export async function getCounselorActivitySummary(since: Date, until?: Date) {
  const [sessions, incidents, followUpsOpen, parentContacts] = await Promise.all([
    db.counselingSession.count({
      where: { deletedAt: null, sessionDate: { gte: since, ...(until ? { lte: until } : {}) } },
    }),
    db.incident.count({
      where: { deletedAt: null, incidentDate: { gte: since, ...(until ? { lte: until } : {}) } },
    }),
    db.followUp.count({ where: { deletedAt: null, status: { in: ["PENDING", "IN_PROGRESS"] } } }),
    db.parentContact.count({ where: { contactDate: { gte: since, ...(until ? { lte: until } : {}) } } }),
  ]);
  return { sessions, incidents, followUpsOpen, parentContacts };
}

export async function getSessionsByCategory(since: Date, until?: Date) {
  const rows = await db.counselingSession.groupBy({
    by: ["counselingCategoryId"],
    where: { deletedAt: null, sessionDate: { gte: since, ...(until ? { lte: until } : {}) } },
    _count: { _all: true },
  });
  const categories = await db.counselingCategory.findMany();
  const byId = new Map(categories.map((c) => [c.id, c.name]));
  return rows.map((r) => ({
    name: byId.get(r.counselingCategoryId) ?? "Unknown",
    count: r._count._all,
  }));
}

export async function getRiskLevelDistribution(since: Date, until?: Date) {
  const rows = await db.counselingSession.groupBy({
    by: ["riskLevel"],
    where: { deletedAt: null, sessionDate: { gte: since, ...(until ? { lte: until } : {}) } },
    _count: { _all: true },
  });
  return rows.map((r) => ({ name: r.riskLevel, count: r._count._all }));
}

export async function getIncidentsByCategory(since: Date, until?: Date) {
  const rows = await db.incident.groupBy({
    by: ["incidentCategoryId"],
    where: { deletedAt: null, incidentDate: { gte: since, ...(until ? { lte: until } : {}) } },
    _count: { _all: true },
  });
  const categories = await db.incidentCategory.findMany();
  const byId = new Map(categories.map((c) => [c.id, c.name]));
  return rows.map((r) => ({
    name: byId.get(r.incidentCategoryId) ?? "Unknown",
    count: r._count._all,
  }));
}

// Both trend queries aggregate week buckets in SQL rather than pulling every
// matching row into Node to bucket in JS — the previous implementation was a
// full unbounded scan on every dashboard load. Bucket boundary matches the
// old JS logic exactly (Sunday-start weeks, via day-of-week subtraction)
// rather than Postgres's default ISO (Monday-start) date_trunc('week', ...).
export async function getOpenIncidentsTrend(weeks: number) {
  const since = new Date();
  since.setDate(since.getDate() - weeks * 7);

  const rows = await db.$queryRaw<{ week: Date; count: bigint }[]>`
    SELECT
      date_trunc('day', "created_at") - make_interval(days => EXTRACT(DOW FROM "created_at")::int) AS week,
      COUNT(*)::bigint AS count
    FROM "incidents"
    WHERE "deleted_at" IS NULL AND "created_at" >= ${since}
    GROUP BY week
    ORDER BY week ASC
  `;

  return rows.map((r) => ({ week: r.week.toISOString().slice(0, 10), count: Number(r.count) }));
}

export async function getBehaviorTrend(weeks: number) {
  const since = new Date();
  since.setDate(since.getDate() - weeks * 7);

  const rows = await db.$queryRaw<{ week: Date; count: bigint }[]>`
    SELECT
      date_trunc('day', "record_date") - make_interval(days => EXTRACT(DOW FROM "record_date")::int) AS week,
      COUNT(*)::bigint AS count
    FROM "behavior_records"
    WHERE "deleted_at" IS NULL AND "record_date" >= ${since}
    GROUP BY week
    ORDER BY week ASC
  `;

  return rows.map((r) => ({ week: r.week.toISOString().slice(0, 10), count: Number(r.count) }));
}

export async function getFollowUpCompletionRate(since: Date, until?: Date) {
  const [total, completed] = await Promise.all([
    db.followUp.count({ where: { createdAt: { gte: since, ...(until ? { lte: until } : {}) } } }),
    db.followUp.count({
      where: { createdAt: { gte: since, ...(until ? { lte: until } : {}) }, status: "COMPLETED" },
    }),
  ]);
  return { total, completed, rate: total === 0 ? 0 : Math.round((completed / total) * 100) };
}

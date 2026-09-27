import { db } from "@/lib/db";
import { formatStudentName } from "@/lib/utils";

export type JournalSortKey = "date";

export type JournalListFilters = {
  // Required, not optional — every caller must explicitly scope the list to
  // one author. There is no "list everyone's journal entries" query in this
  // module; that access pattern doesn't exist here on purpose.
  authorUserId: string;
  search?: string;
  sort?: JournalSortKey;
  dir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export async function listJournalEntries(filters: JournalListFilters) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 25;
  const dir = filters.dir ?? "desc";
  const where = {
    authorUserId: filters.authorUserId,
    deletedAt: null,
    ...(filters.search
      ? {
          OR: [
            { title: { contains: filters.search, mode: "insensitive" as const } },
            { note: { contains: filters.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [entries, total] = await Promise.all([
    db.counselorJournalEntry.findMany({
      where,
      orderBy: { entryDate: dir },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        linkedSessions: { include: { counselingSession: { include: { student: true } } } },
        linkedIncidents: { include: { incident: { include: { primaryStudent: true } } } },
        linkedBehaviorRecords: { include: { behaviorRecord: { include: { student: true } } } },
      },
    }),
    db.counselorJournalEntry.count({ where }),
  ]);

  return { entries, total, page, pageSize };
}

// Scoped by authorUserId in the query itself, not just checked after the
// fact — a guessed/foreign entry id can never resolve here, even before the
// service layer's own ownership check runs.
export async function findJournalEntryById(id: string, authorUserId: string) {
  return db.counselorJournalEntry.findFirst({
    where: { id, authorUserId, deletedAt: null },
    include: {
      linkedSessions: { include: { counselingSession: { include: { student: true } } } },
      linkedIncidents: { include: { incident: { include: { primaryStudent: true } } } },
      linkedBehaviorRecords: { include: { behaviorRecord: { include: { student: true } } } },
    },
  });
}

// Summary tiles for the top of the Journal page — all scoped to this one
// author. `spark` is a 7-bucket count of entries over the last 7 days
// (oldest → newest) for the lead tile's sparkline.
export async function getJournalStats(authorUserId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);

  const [entriesThisMonth, linkedSessions, linkedIncidents, linkedBehaviorRecords, recent] =
    await Promise.all([
      db.counselorJournalEntry.count({
        where: { authorUserId, deletedAt: null, entryDate: { gte: startOfMonth } },
      }),
      db.counselorJournalEntrySession.count({
        where: { journalEntry: { authorUserId, deletedAt: null } },
      }),
      db.counselorJournalEntryIncident.count({
        where: { journalEntry: { authorUserId, deletedAt: null } },
      }),
      db.counselorJournalEntryBehaviorRecord.count({
        where: { journalEntry: { authorUserId, deletedAt: null } },
      }),
      db.counselorJournalEntry.findMany({
        where: { authorUserId, deletedAt: null, entryDate: { gte: sevenDaysAgo } },
        select: { entryDate: true },
      }),
    ]);

  const spark = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(sevenDaysAgo.getFullYear(), sevenDaysAgo.getMonth(), sevenDaysAgo.getDate() + i);
    return recent.filter((e) => e.entryDate.toDateString() === day.toDateString()).length;
  });

  return { entriesThisMonth, linkedSessions, linkedIncidents, linkedBehaviorRecords, spark };
}

// Option lists for the journal entry's optional link pickers — scoped to
// records this specific counselor already owns (ran the session / reported
// the incident), never the full org-wide list.
export async function listLinkableSessionsForCounselor(counselorId: string) {
  const sessions = await db.counselingSession.findMany({
    where: { counselorId, deletedAt: null },
    include: { student: true },
    orderBy: { sessionDate: "desc" },
    take: 200,
  });

  return sessions.map((s) => ({
    id: s.id,
    date: s.sessionDate.toISOString().slice(0, 10),
    label: `${s.sessionDate.toLocaleDateString()} · ${formatStudentName(s.student)} · ${s.purpose}`,
  }));
}

export async function listLinkableIncidentsForCounselor(reportedByUserId: string) {
  const incidents = await db.incident.findMany({
    where: { reportedByUserId, deletedAt: null },
    include: { primaryStudent: true },
    orderBy: { incidentDate: "desc" },
    take: 200,
  });

  return incidents.map((i) => ({
    id: i.id,
    date: i.incidentDate.toISOString().slice(0, 10),
    label: `${i.incidentNumber} · ${i.incidentDate.toLocaleDateString()} · ${formatStudentName(i.primaryStudent)}`,
  }));
}

// "Minor behavior report" rows — BehaviorRecords with no incidentId, i.e.
// not already folded into a major incident.
export async function listLinkableBehaviorRecordsForCounselor(recordedByUserId: string) {
  const records = await db.behaviorRecord.findMany({
    where: { recordedByUserId, incidentId: null, deletedAt: null },
    include: { student: true, categories: { include: { behaviorCategory: true } } },
    orderBy: { recordDate: "desc" },
    take: 200,
  });

  return records.map((r) => ({
    id: r.id,
    date: r.recordDate.toISOString().slice(0, 10),
    label: `${r.recordDate.toLocaleDateString()} · ${formatStudentName(r.student)} · ${
      [...r.categories.map((c) => c.behaviorCategory.name), r.otherBehaviorText].filter(Boolean).join(", ") ||
      "Behavior log"
    }`,
  }));
}

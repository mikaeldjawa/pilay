import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { logAudit } from "@/modules/audit/audit.service";
import type {
  CreateJournalEntryInput,
  UpdateJournalEntryInput,
} from "@/modules/journal/journal.schema";

export class JournalServiceError extends Error {}

// Re-checks ownership against the DB rather than trusting the submitted ids
// wholesale — a session/incident id that isn't this counselor's own is
// silently dropped instead of linked.
async function filterOwnedSessionIds(tx: Prisma.TransactionClient, sessionIds: string[], counselorId: string) {
  if (sessionIds.length === 0) return [];
  const owned = await tx.counselingSession.findMany({
    where: { id: { in: sessionIds }, counselorId, deletedAt: null },
    select: { id: true },
  });
  return owned.map((s) => s.id);
}

async function filterOwnedIncidentIds(tx: Prisma.TransactionClient, incidentIds: string[], reportedByUserId: string) {
  if (incidentIds.length === 0) return [];
  const owned = await tx.incident.findMany({
    where: { id: { in: incidentIds }, reportedByUserId, deletedAt: null },
    select: { id: true },
  });
  return owned.map((i) => i.id);
}

async function filterOwnedBehaviorRecordIds(
  tx: Prisma.TransactionClient,
  behaviorRecordIds: string[],
  recordedByUserId: string,
) {
  if (behaviorRecordIds.length === 0) return [];
  const owned = await tx.behaviorRecord.findMany({
    where: { id: { in: behaviorRecordIds }, recordedByUserId, deletedAt: null },
    select: { id: true },
  });
  return owned.map((r) => r.id);
}

export async function createJournalEntry(input: CreateJournalEntryInput, authorUserId: string) {
  return db.$transaction(async (tx) => {
    const [sessionIds, incidentIds, behaviorRecordIds] = await Promise.all([
      filterOwnedSessionIds(tx, input.sessionIds, authorUserId),
      filterOwnedIncidentIds(tx, input.incidentIds, authorUserId),
      filterOwnedBehaviorRecordIds(tx, input.behaviorRecordIds, authorUserId),
    ]);

    const entry = await tx.counselorJournalEntry.create({
      data: {
        authorUserId,
        entryDate: new Date(input.entryDate),
        entryTime: input.entryTime || null,
        title: input.title,
        note: input.note,
        linkedSessions: {
          create: sessionIds.map((counselingSessionId) => ({ counselingSessionId })),
        },
        linkedIncidents: {
          create: incidentIds.map((incidentId) => ({ incidentId })),
        },
        linkedBehaviorRecords: {
          create: behaviorRecordIds.map((behaviorRecordId) => ({ behaviorRecordId })),
        },
      },
    });

    await logAudit(tx, {
      userId: authorUserId,
      action: "CREATE",
      entityType: "journal_entry",
      entityId: entry.id,
    });

    return entry;
  });
}

export async function updateJournalEntry(
  id: string,
  input: UpdateJournalEntryInput,
  actorUserId: string,
) {
  return db.$transaction(async (tx) => {
    const existing = await tx.counselorJournalEntry.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new JournalServiceError("Journal entry not found.");
    }
    if (existing.authorUserId !== actorUserId) {
      throw new JournalServiceError("You can only edit your own journal entries.");
    }

    const [sessionIds, incidentIds, behaviorRecordIds] = await Promise.all([
      filterOwnedSessionIds(tx, input.sessionIds, actorUserId),
      filterOwnedIncidentIds(tx, input.incidentIds, actorUserId),
      filterOwnedBehaviorRecordIds(tx, input.behaviorRecordIds, actorUserId),
    ]);

    const entry = await tx.counselorJournalEntry.update({
      where: { id },
      data: {
        entryDate: new Date(input.entryDate),
        entryTime: input.entryTime || null,
        title: input.title,
        note: input.note,
        linkedSessions: {
          deleteMany: {},
          create: sessionIds.map((counselingSessionId) => ({ counselingSessionId })),
        },
        linkedIncidents: {
          deleteMany: {},
          create: incidentIds.map((incidentId) => ({ incidentId })),
        },
        linkedBehaviorRecords: {
          deleteMany: {},
          create: behaviorRecordIds.map((behaviorRecordId) => ({ behaviorRecordId })),
        },
      },
    });

    await logAudit(tx, {
      userId: actorUserId,
      action: "UPDATE",
      entityType: "journal_entry",
      entityId: entry.id,
    });

    return entry;
  });
}

export async function archiveJournalEntry(id: string, actorUserId: string) {
  return db.$transaction(async (tx) => {
    const existing = await tx.counselorJournalEntry.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new JournalServiceError("Journal entry not found or already archived.");
    }
    if (existing.authorUserId !== actorUserId) {
      throw new JournalServiceError("You can only archive your own journal entries.");
    }

    const entry = await tx.counselorJournalEntry.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: actorUserId },
    });

    await logAudit(tx, {
      userId: actorUserId,
      action: "ARCHIVE",
      entityType: "journal_entry",
      entityId: entry.id,
    });

    return entry;
  });
}

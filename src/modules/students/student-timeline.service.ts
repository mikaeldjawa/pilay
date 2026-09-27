// Aggregates every domain event tied to a student into one chronological feed
// (PRD "One Student. One History. One System.").

import { db } from "@/lib/db";
import { formatStudentName } from "@/lib/utils";

export type TimelineEvent =
  | { type: "counseling_session"; id: string; date: Date; summary: string }
  | { type: "counseling_session_subject"; id: string; date: Date; summary: string }
  | { type: "incident"; id: string; date: Date; summary: string }
  | { type: "behavior_record"; id: string; date: Date; summary: string }
  | { type: "follow_up"; id: string; date: Date; summary: string }
  | { type: "parent_contact"; id: string; date: Date; summary: string }
  | { type: "generated_report"; id: string; date: Date; summary: string };

// Bound per source rather than fetching a student's entire multi-year
// history on every profile view — the merged feed is re-sorted below anyway,
// and callers only ever show the most recent slice (Overview: 3, Timeline
// tab: everything returned here).
const TIMELINE_SOURCE_LIMIT = 50;

export async function getStudentTimeline(studentId: string): Promise<TimelineEvent[]> {
  const [
    attendingSessions,
    subjectSessions,
    incidents,
    behaviorRecords,
    followUps,
    parentContacts,
    generatedReports,
  ] = await Promise.all([
    db.counselingSession.findMany({
      where: { studentId, deletedAt: null },
      include: { counselingCategory: true },
      orderBy: { sessionDate: "desc" },
      take: TIMELINE_SOURCE_LIMIT,
    }),
    db.counselingSession.findMany({
      where: { subjectStudentId: studentId, deletedAt: null },
      include: { counselingCategory: true, student: true },
      orderBy: { sessionDate: "desc" },
      take: TIMELINE_SOURCE_LIMIT,
    }),
    db.incident.findMany({
      where: { primaryStudentId: studentId, deletedAt: null },
      include: { incidentCategory: true },
      orderBy: { incidentDate: "desc" },
      take: TIMELINE_SOURCE_LIMIT,
    }),
    db.behaviorRecord.findMany({
      where: { studentId, deletedAt: null },
      include: {
        categories: { include: { behaviorCategory: true } },
        actions: { include: { actionCode: true } },
      },
      orderBy: { recordDate: "desc" },
      take: TIMELINE_SOURCE_LIMIT,
    }),
    db.followUp.findMany({
      where: { studentId, deletedAt: null },
      orderBy: { dueDate: "desc" },
      take: TIMELINE_SOURCE_LIMIT,
    }),
    db.parentContact.findMany({
      where: { studentId, deletedAt: null },
      include: { guardian: true },
      orderBy: { contactDate: "desc" },
      take: TIMELINE_SOURCE_LIMIT,
    }),
    db.generatedReport.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      take: TIMELINE_SOURCE_LIMIT,
    }),
  ]);

  const events: TimelineEvent[] = [
    ...attendingSessions.map((s) => ({
      type: "counseling_session" as const,
      id: s.id,
      date: s.sessionDate,
      summary: `${s.counselingCategory.name} counseling session (${s.status})`,
    })),
    ...subjectSessions.map((s) => ({
      type: "counseling_session_subject" as const,
      id: s.id,
      date: s.sessionDate,
      summary: `Discussed as subject in a ${s.counselingCategory.name} session with ${formatStudentName(s.student)}`,
    })),
    ...incidents.map((i) => ({
      type: "incident" as const,
      id: i.id,
      date: i.incidentDate,
      summary: `${i.incidentCategory.name} incident (${i.incidentNumber}) — ${i.status.replaceAll("_", " ")}`,
    })),
    ...behaviorRecords.map((b) => {
      const categories = [...b.categories.map((c) => c.behaviorCategory.name), b.otherBehaviorText]
        .filter(Boolean)
        .join(", ");
      const actions = [...b.actions.map((a) => a.actionCode.name), b.otherActionText]
        .filter(Boolean)
        .join(", ");
      return {
        type: "behavior_record" as const,
        id: b.id,
        date: b.recordDate,
        summary: actions ? `${categories} — ${actions}` : categories,
      };
    }),
    ...followUps.map((f) => ({
      type: "follow_up" as const,
      id: f.id,
      date: f.dueDate,
      summary: `Follow-up: ${f.title} (${f.status.replaceAll("_", " ")})`,
    })),
    ...parentContacts.map((c) => ({
      type: "parent_contact" as const,
      id: c.id,
      date: c.contactDate,
      summary: `Parent contact via ${c.method} with ${c.guardian.fullName} — ${c.reason}`,
    })),
    ...generatedReports.map((r) => ({
      type: "generated_report" as const,
      id: r.id,
      date: r.createdAt,
      summary: `${r.reportType.replaceAll("_", " ")} report generated (${r.reportNumber})`,
    })),
  ];

  events.sort((a, b) => b.date.getTime() - a.date.getTime());
  return events;
}

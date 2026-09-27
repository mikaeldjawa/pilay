import { db } from "@/lib/db";
import { getChronicCountsForPairs } from "@/modules/behavior/behavior.service";

export async function gatherCounselingCaseData(counselingSessionId: string) {
  const session = await db.counselingSession.findUniqueOrThrow({
    where: { id: counselingSessionId },
    include: {
      student: true,
      subjectStudent: true,
      counselor: true,
      counselingCategory: true,
      note: true,
      keyTakeaways: { orderBy: { sequenceOrder: "asc" } },
      timelineEvents: { orderBy: { sequenceOrder: "asc" } },
      peerPerceptions: { orderBy: { sequenceOrder: "asc" } },
      groupObservations: { orderBy: { sequenceOrder: "asc" } },
      objectiveFindings: { orderBy: { sequenceOrder: "asc" } },
      riskAssessments: { orderBy: { sequenceOrder: "asc" }, include: { riskDimension: true } },
      actionItems: { orderBy: { sequenceOrder: "asc" } },
    },
  });
  return session;
}

export async function gatherMajorIncidentData(incidentId: string) {
  const incident = await db.incident.findUniqueOrThrow({
    where: { id: incidentId },
    include: {
      primaryStudent: true,
      reportedBy: true,
      incidentCategory: true,
      narrative: true,
      response: true,
      participants: {
        include: {
          student: {
            include: {
              enrollments: {
                where: { endDate: null },
                include: { grade: true, class: true },
                take: 1,
              },
            },
          },
        },
      },
      witnesses: true,
      categorySelections: { include: { incidentCategory: true } },
      signoffs: true,
      parentContacts: {
        where: { deletedAt: null },
        include: { guardian: true },
        orderBy: { contactDate: "desc" },
        take: 1,
      },
    },
  });
  return incident;
}

export async function gatherMinorBehaviorLogData(params: {
  dateFrom: Date;
  dateTo: Date;
  classroomReference?: string;
  classId?: string;
}) {
  const records = await db.behaviorRecord.findMany({
    where: {
      recordDate: { gte: params.dateFrom, lte: params.dateTo },
      deletedAt: null,
      ...(params.classroomReference ? { classroomReference: params.classroomReference } : {}),
      ...(params.classId
        ? { student: { enrollments: { some: { endDate: null, classId: params.classId } } } }
        : {}),
    },
    include: {
      student: true,
      categories: { include: { behaviorCategory: true } },
      actions: { include: { actionCode: true } },
      recordedBy: true,
    },
    orderBy: [{ recordDate: "asc" }, { recordTime: "asc" }],
    take: 5000,
  });

  const chronicCounts = await getChronicCountsForPairs(
    records.flatMap((r) => r.categories.map((c) => ({ studentId: r.studentId, behaviorCategoryId: c.behaviorCategoryId }))),
  );

  // A record with multiple codes counts as chronic if any one of its codes
  // is — the printed grid's tick marks reflect the worst (highest) count
  // among the record's codes.
  return records.map((record) => {
    const patterns = record.categories.map(
      (c) => chronicCounts.get(`${record.studentId}:${c.behaviorCategoryId}`) ?? { count: 0, isChronic: false },
    );
    const isChronic = patterns.some((p) => p.isChronic);
    const chronicCount = patterns.reduce((max, p) => Math.max(max, p.count), 0);
    return { record, isChronic, chronicCount };
  });
}

// One student's full record across all three report templates — every
// counseling session, every major incident, and every minor behavior log —
// gathered with the exact same `include` shape each standalone report
// generator uses, so the merged report can reuse those templates' actual
// section builders verbatim instead of a simplified summary.
export async function gatherStudentFullReportData(studentId: string) {
  const student = await db.student.findUniqueOrThrow({
    where: { id: studentId },
    include: {
      enrollments: { where: { endDate: null }, include: { grade: true, class: true }, take: 1 },
      guardians: {
        include: { guardian: true },
        orderBy: [{ isPrimaryContact: "desc" }, { isEmergencyContact: "desc" }],
      },
    },
  });

  const [counselingSessions, incidents, behaviorRecords] = await Promise.all([
    db.counselingSession.findMany({
      where: {
        OR: [{ studentId }, { subjectStudentId: studentId }],
        deletedAt: null,
      },
      include: {
        student: true,
        subjectStudent: true,
        counselor: true,
        counselingCategory: true,
        note: true,
        keyTakeaways: { orderBy: { sequenceOrder: "asc" } },
        timelineEvents: { orderBy: { sequenceOrder: "asc" } },
        peerPerceptions: { orderBy: { sequenceOrder: "asc" } },
        groupObservations: { orderBy: { sequenceOrder: "asc" } },
        objectiveFindings: { orderBy: { sequenceOrder: "asc" } },
        riskAssessments: { orderBy: { sequenceOrder: "asc" }, include: { riskDimension: true } },
        actionItems: { orderBy: { sequenceOrder: "asc" } },
      },
      orderBy: { sessionDate: "asc" },
    }),
    db.incident.findMany({
      where: { primaryStudentId: studentId, deletedAt: null },
      include: {
        primaryStudent: true,
        reportedBy: true,
        incidentCategory: true,
        narrative: true,
        response: true,
        participants: {
          include: {
            student: {
              include: {
                enrollments: {
                  where: { endDate: null },
                  include: { grade: true, class: true },
                  take: 1,
                },
              },
            },
          },
        },
        witnesses: true,
        categorySelections: { include: { incidentCategory: true } },
        signoffs: true,
        parentContacts: {
          where: { deletedAt: null },
          include: { guardian: true },
          orderBy: { contactDate: "desc" },
          take: 1,
        },
      },
      orderBy: { incidentDate: "asc" },
    }),
    db.behaviorRecord.findMany({
      where: { studentId, deletedAt: null },
      include: {
        student: true,
        categories: { include: { behaviorCategory: true } },
        actions: { include: { actionCode: true } },
        recordedBy: true,
      },
      orderBy: [{ recordDate: "asc" }, { recordTime: "asc" }],
    }),
  ]);

  const chronicCounts = await getChronicCountsForPairs(
    behaviorRecords.flatMap((r) => r.categories.map((c) => ({ studentId: r.studentId, behaviorCategoryId: c.behaviorCategoryId }))),
  );
  const behaviorRows = behaviorRecords.map((record) => {
    const patterns = record.categories.map(
      (c) => chronicCounts.get(`${record.studentId}:${c.behaviorCategoryId}`) ?? { count: 0, isChronic: false },
    );
    return {
      record,
      isChronic: patterns.some((p) => p.isChronic),
      chronicCount: patterns.reduce((max, p) => Math.max(max, p.count), 0),
    };
  });

  return { student, counselingSessions, incidents, behaviorRows };
}

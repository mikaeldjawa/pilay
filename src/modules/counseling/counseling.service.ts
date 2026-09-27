import { db } from "@/lib/db";
import { logAudit } from "@/modules/audit/audit.service";
import type {
  CreateCounselingSessionInput,
  UpdateCounselingSessionInput,
} from "@/modules/counseling/counseling.schema";

export class CounselingServiceError extends Error {}

export async function createCounselingSession(
  input: CreateCounselingSessionInput,
  counselorId: string,
) {
  return db.$transaction(async (tx) => {
    const session = await tx.counselingSession.create({
      data: {
        studentId: input.studentId,
        subjectStudentId: input.subjectStudentId || null,
        counselorId,
        counselingCategoryId: input.counselingCategoryId,
        sessionDate: new Date(input.sessionDate),
        startTime: input.startTime || null,
        endTime: input.endTime || null,
        purpose: input.purpose,
        riskLevel: input.riskLevel,
        status: input.status,
        followUpRequired: input.followUpRequired === "on",
      },
    });

    await tx.counselingNote.create({
      data: {
        counselingSessionId: session.id,
        presentationEngagement: input.presentationEngagement || null,
        emotionalAffect: input.emotionalAffect || null,
        credibilityObjectivity: input.credibilityObjectivity || null,
        credibilityRating: input.credibilityRating || null,
        actionTaken: input.actionTaken || null,
        followUpNotes: input.followUpNotes || null,
        summaryContext: input.summaryContext || null,
        summaryPeerDynamic: input.summaryPeerDynamic || null,
        summaryConclusion: input.summaryConclusion || null,
      },
    });

    if (input.keyTakeaways.length) {
      await tx.counselingKeyTakeaway.createMany({
        data: input.keyTakeaways.map((row, i) => ({
          counselingSessionId: session.id,
          sequenceOrder: i,
          title: row.title,
          body: row.body,
        })),
      });
    }

    if (input.timelineEvents.length) {
      await tx.counselingTimelineEvent.createMany({
        data: input.timelineEvents.map((row, i) => ({
          counselingSessionId: session.id,
          sequenceOrder: i,
          phase: row.phase,
          title: row.title || null,
          body: row.body,
        })),
      });
    }

    if (input.peerPerceptions.length) {
      await tx.counselingPeerPerception.createMany({
        data: input.peerPerceptions.map((row, i) => ({
          counselingSessionId: session.id,
          sequenceOrder: i,
          title: row.title,
          body: row.body,
        })),
      });
    }

    if (input.groupObservations.length) {
      await tx.counselingGroupObservation.createMany({
        data: input.groupObservations.map((row, i) => ({
          counselingSessionId: session.id,
          sequenceOrder: i,
          title: row.title,
          body: row.body,
        })),
      });
    }

    if (input.objectiveFindings.length) {
      await tx.counselingObjectiveFinding.createMany({
        data: input.objectiveFindings.map((row, i) => ({
          counselingSessionId: session.id,
          sequenceOrder: i,
          title: row.title,
          body: row.body,
        })),
      });
    }

    if (input.riskAssessments.length) {
      await tx.counselingRiskAssessment.createMany({
        data: input.riskAssessments.map((row, i) => ({
          counselingSessionId: session.id,
          sequenceOrder: i,
          riskDimensionId: row.riskDimensionId,
          subjectLabel: row.subjectLabel || null,
          riskLevel: row.riskLevel,
          justification: row.justification,
        })),
      });
    }

    if (input.actionItems.length) {
      await tx.counselingActionItem.createMany({
        data: input.actionItems.map((row, i) => ({
          counselingSessionId: session.id,
          sequenceOrder: i,
          title: row.title,
          body: row.body,
          owner: row.owner || null,
        })),
      });
    }

    // Follow-up enforcement (Tech doc §23): a session flagged as needing
    // follow-up must not commit without a linked follow_ups row.
    if (input.followUpRequired === "on") {
      if (!input.followUpTitle || !input.followUpDueDate) {
        throw new CounselingServiceError(
          "Follow-up title and due date are required when follow-up is marked required.",
        );
      }
      await tx.followUp.create({
        data: {
          studentId: input.studentId,
          createdByUserId: counselorId,
          relatedSessionId: session.id,
          title: input.followUpTitle,
          dueDate: new Date(input.followUpDueDate),
          priority: "NORMAL",
          status: "PENDING",
        },
      });
    }

    await logAudit(tx, {
      userId: counselorId,
      action: "CREATE",
      entityType: "counseling_session",
      entityId: session.id,
    });

    return session;
  });
}

export async function updateCounselingSession(
  id: string,
  input: UpdateCounselingSessionInput,
  counselorId: string,
) {
  return db.$transaction(async (tx) => {
    const session = await tx.counselingSession.update({
      where: { id },
      data: {
        studentId: input.studentId,
        subjectStudentId: input.subjectStudentId || null,
        counselingCategoryId: input.counselingCategoryId,
        sessionDate: new Date(input.sessionDate),
        startTime: input.startTime || null,
        endTime: input.endTime || null,
        purpose: input.purpose,
        riskLevel: input.riskLevel,
        status: input.status,
        followUpRequired: input.followUpRequired === "on",
      },
    });

    await tx.counselingNote.update({
      where: { counselingSessionId: id },
      data: {
        presentationEngagement: input.presentationEngagement || null,
        emotionalAffect: input.emotionalAffect || null,
        credibilityObjectivity: input.credibilityObjectivity || null,
        credibilityRating: input.credibilityRating || null,
        actionTaken: input.actionTaken || null,
        followUpNotes: input.followUpNotes || null,
        summaryContext: input.summaryContext || null,
        summaryPeerDynamic: input.summaryPeerDynamic || null,
        summaryConclusion: input.summaryConclusion || null,
      },
    });

    // Replace-all for the repeating sections — same shape as create, simpler
    // and safer than diffing individual rows against sequenceOrder.
    await tx.counselingKeyTakeaway.deleteMany({ where: { counselingSessionId: id } });
    if (input.keyTakeaways.length) {
      await tx.counselingKeyTakeaway.createMany({
        data: input.keyTakeaways.map((row, i) => ({
          counselingSessionId: id,
          sequenceOrder: i,
          title: row.title,
          body: row.body,
        })),
      });
    }

    await tx.counselingTimelineEvent.deleteMany({ where: { counselingSessionId: id } });
    if (input.timelineEvents.length) {
      await tx.counselingTimelineEvent.createMany({
        data: input.timelineEvents.map((row, i) => ({
          counselingSessionId: id,
          sequenceOrder: i,
          phase: row.phase,
          title: row.title || null,
          body: row.body,
        })),
      });
    }

    await tx.counselingPeerPerception.deleteMany({ where: { counselingSessionId: id } });
    if (input.peerPerceptions.length) {
      await tx.counselingPeerPerception.createMany({
        data: input.peerPerceptions.map((row, i) => ({
          counselingSessionId: id,
          sequenceOrder: i,
          title: row.title,
          body: row.body,
        })),
      });
    }

    await tx.counselingGroupObservation.deleteMany({ where: { counselingSessionId: id } });
    if (input.groupObservations.length) {
      await tx.counselingGroupObservation.createMany({
        data: input.groupObservations.map((row, i) => ({
          counselingSessionId: id,
          sequenceOrder: i,
          title: row.title,
          body: row.body,
        })),
      });
    }

    await tx.counselingObjectiveFinding.deleteMany({ where: { counselingSessionId: id } });
    if (input.objectiveFindings.length) {
      await tx.counselingObjectiveFinding.createMany({
        data: input.objectiveFindings.map((row, i) => ({
          counselingSessionId: id,
          sequenceOrder: i,
          title: row.title,
          body: row.body,
        })),
      });
    }

    await tx.counselingRiskAssessment.deleteMany({ where: { counselingSessionId: id } });
    if (input.riskAssessments.length) {
      await tx.counselingRiskAssessment.createMany({
        data: input.riskAssessments.map((row, i) => ({
          counselingSessionId: id,
          sequenceOrder: i,
          riskDimensionId: row.riskDimensionId,
          subjectLabel: row.subjectLabel || null,
          riskLevel: row.riskLevel,
          justification: row.justification,
        })),
      });
    }

    await tx.counselingActionItem.deleteMany({ where: { counselingSessionId: id } });
    if (input.actionItems.length) {
      await tx.counselingActionItem.createMany({
        data: input.actionItems.map((row, i) => ({
          counselingSessionId: id,
          sequenceOrder: i,
          title: row.title,
          body: row.body,
          owner: row.owner || null,
        })),
      });
    }

    // Only create a follow-up if one isn't already linked to this session —
    // editing an existing linked follow-up is done from the Follow-ups page.
    if (input.followUpRequired === "on" && input.followUpTitle && input.followUpDueDate) {
      const existingFollowUp = await tx.followUp.findFirst({ where: { relatedSessionId: id } });
      if (!existingFollowUp) {
        await tx.followUp.create({
          data: {
            studentId: input.studentId,
            createdByUserId: counselorId,
            relatedSessionId: id,
            title: input.followUpTitle,
            dueDate: new Date(input.followUpDueDate),
            priority: "NORMAL",
            status: "PENDING",
          },
        });
      }
    }

    await logAudit(tx, {
      userId: counselorId,
      action: "UPDATE",
      entityType: "counseling_session",
      entityId: session.id,
    });

    return session;
  });
}

export async function archiveCounselingSession(id: string, deletedBy: string) {
  return db.$transaction(async (tx) => {
    const session = await tx.counselingSession.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });

    await logAudit(tx, {
      userId: deletedBy,
      action: "ARCHIVE",
      entityType: "counseling_session",
      entityId: session.id,
    });

    return session;
  });
}

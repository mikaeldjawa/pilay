import { db } from "@/lib/db";
import { isUniqueConstraintViolation } from "@/lib/prisma-errors";
import { nextIncidentNumber } from "@/modules/incidents/incident-number.service";
import { logAudit } from "@/modules/audit/audit.service";
import { escalateToMajorIncident } from "@/modules/behavior/behavior.service";
import type {
  CreateMajorIncidentInput,
  UpdateMajorIncidentInput,
} from "@/modules/incidents/incident.schema";

export class IncidentServiceError extends Error {}

export async function createMajorIncident(input: CreateMajorIncidentInput, reportedByUserId: string) {
  // nextIncidentNumber() picks the next free number outside any row lock, so
  // a genuine concurrent submission (two "File major incident" forms landing
  // at once) can still race for the same number. Retry a few times with a
  // freshly recomputed number rather than surfacing the raw unique-constraint
  // error — same pattern as reports/report.service.ts::startReport.
  const MAX_ATTEMPTS = 5;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await runCreateMajorIncident(input, reportedByUserId);
    } catch (error) {
      const isIncidentNumberConflict = isUniqueConstraintViolation(error, "incident_number");

      if (!isIncidentNumberConflict || attempt === MAX_ATTEMPTS) {
        throw error;
      }
    }
  }

  throw new IncidentServiceError("Could not allocate a unique incident number.");
}

async function runCreateMajorIncident(input: CreateMajorIncidentInput, reportedByUserId: string) {
  return db.$transaction(async (tx) => {
    const academicYear = await tx.academicYear.findFirst({ where: { isCurrent: true } });
    if (!academicYear) {
      throw new IncidentServiceError("No current academic year is configured.");
    }

    if (input.parentContactRequired === "on" && (!input.followUpTitle || !input.followUpDueDate)) {
      throw new IncidentServiceError(
        "Follow-up title and due date are required when parent contact is required.",
      );
    }

    const incidentNumber = await nextIncidentNumber(tx, academicYear.startDate.getFullYear());

    const incident = await tx.incident.create({
      data: {
        incidentNumber,
        primaryStudentId: input.primaryStudentId,
        reportedByUserId,
        incidentCategoryId: input.incidentCategoryId,
        academicYearId: academicYear.id,
        severity: "MAJOR",
        incidentDate: new Date(input.incidentDate),
        incidentTime: input.incidentTime || null,
        location: input.location || null,
        counselorOrAdminCalledAt: input.counselorOrAdminCalledAt
          ? new Date(input.counselorOrAdminCalledAt)
          : null,
        status: "NEW",
        parentContactRequired: input.parentContactRequired === "on",
        leadershipNotified: input.leadershipNotified === "on",
        supportPlan: input.supportPlan || null,
      },
    });

    await tx.incidentNarrative.create({
      data: {
        incidentId: incident.id,
        antecedent: input.antecedent,
        behavior: input.behavior,
        impact: input.impact,
        additionalInformation: input.additionalInformation || null,
      },
    });

    await tx.incidentResponse.create({
      data: {
        incidentId: incident.id,
        studentEscortedToOffice: input.studentEscortedToOffice === "on",
        classroomEvacuated: input.classroomEvacuated === "on",
        firstAidOrNurseRequested: input.firstAidOrNurseRequested === "on",
        onsiteDeescalationByCounselor: input.onsiteDeescalationByCounselor === "on",
        additionalAction: input.additionalAction || null,
      },
    });

    await tx.incidentParticipant.createMany({
      data: input.participants.map((p) => ({
        incidentId: incident.id,
        studentId: p.studentId,
        involvementType: p.involvementType,
        notes: p.notes || null,
      })),
    });

    if (input.witnesses.length) {
      await tx.incidentWitness.createMany({
        data: input.witnesses.map((w) => ({
          incidentId: incident.id,
          name: w.name,
          role: w.role || null,
          notes: w.notes || null,
        })),
      });
    }

    const categoryIds = Array.from(
      new Set([input.incidentCategoryId, ...input.additionalCategoryIds]),
    );
    await tx.incidentCategorySelection.createMany({
      data: categoryIds.map((incidentCategoryId) => ({ incidentId: incident.id, incidentCategoryId })),
    });

    const now = new Date();
    const signoffs: { role: "REPORTING_STAFF" | "COUNSELOR" | "LEADERSHIP"; signerName: string; userId?: string }[] = [];
    if (input.reportingStaffSignerName) {
      signoffs.push({ role: "REPORTING_STAFF", signerName: input.reportingStaffSignerName });
    }
    if (input.counselorSignerName) {
      signoffs.push({ role: "COUNSELOR", signerName: input.counselorSignerName, userId: reportedByUserId });
    }
    if (input.leadershipSignerName) {
      signoffs.push({ role: "LEADERSHIP", signerName: input.leadershipSignerName });
    }
    if (signoffs.length) {
      await tx.incidentSignoff.createMany({
        data: signoffs.map((s) => ({
          incidentId: incident.id,
          role: s.role,
          signerName: s.signerName,
          userId: s.userId,
          signedAt: now,
        })),
      });
    }

    await escalateToMajorIncident(input.escalateBehaviorRecordIds, incident.id, tx);

    if (input.parentContactRequired === "on" && input.followUpTitle && input.followUpDueDate) {
      await tx.followUp.create({
        data: {
          studentId: input.primaryStudentId,
          createdByUserId: reportedByUserId,
          relatedIncidentId: incident.id,
          title: input.followUpTitle,
          dueDate: new Date(input.followUpDueDate),
          priority: "HIGH",
          status: "PENDING",
        },
      });
    }

    await logAudit(tx, {
      userId: reportedByUserId,
      action: "CREATE",
      entityType: "incident",
      entityId: incident.id,
    });

    return incident;
  });
}

export async function updateMajorIncident(
  id: string,
  input: UpdateMajorIncidentInput,
  userId: string,
) {
  return db.$transaction(async (tx) => {
    const incident = await tx.incident.update({
      where: { id },
      data: {
        primaryStudentId: input.primaryStudentId,
        incidentCategoryId: input.incidentCategoryId,
        incidentDate: new Date(input.incidentDate),
        incidentTime: input.incidentTime || null,
        location: input.location || null,
        counselorOrAdminCalledAt: input.counselorOrAdminCalledAt
          ? new Date(input.counselorOrAdminCalledAt)
          : null,
        status: input.status,
        parentContactRequired: input.parentContactRequired === "on",
        leadershipNotified: input.leadershipNotified === "on",
        supportPlan: input.supportPlan || null,
      },
    });

    await tx.incidentNarrative.update({
      where: { incidentId: id },
      data: {
        antecedent: input.antecedent,
        behavior: input.behavior,
        impact: input.impact,
        additionalInformation: input.additionalInformation || null,
      },
    });

    await tx.incidentResponse.update({
      where: { incidentId: id },
      data: {
        studentEscortedToOffice: input.studentEscortedToOffice === "on",
        classroomEvacuated: input.classroomEvacuated === "on",
        firstAidOrNurseRequested: input.firstAidOrNurseRequested === "on",
        onsiteDeescalationByCounselor: input.onsiteDeescalationByCounselor === "on",
        additionalAction: input.additionalAction || null,
      },
    });

    // Replace-all for participants/witnesses/categories, same shape as create.
    await tx.incidentParticipant.deleteMany({ where: { incidentId: id } });
    await tx.incidentParticipant.createMany({
      data: input.participants.map((p) => ({
        incidentId: id,
        studentId: p.studentId,
        involvementType: p.involvementType,
        notes: p.notes || null,
      })),
    });

    await tx.incidentWitness.deleteMany({ where: { incidentId: id } });
    if (input.witnesses.length) {
      await tx.incidentWitness.createMany({
        data: input.witnesses.map((w) => ({
          incidentId: id,
          name: w.name,
          role: w.role || null,
          notes: w.notes || null,
        })),
      });
    }

    const categoryIds = Array.from(new Set([input.incidentCategoryId, ...input.additionalCategoryIds]));
    await tx.incidentCategorySelection.deleteMany({ where: { incidentId: id } });
    await tx.incidentCategorySelection.createMany({
      data: categoryIds.map((incidentCategoryId) => ({ incidentId: id, incidentCategoryId })),
    });

    // Sign-offs: replace-all from whichever signer names are (re)supplied.
    // Re-editing resets signedAt for that role, treated as re-confirming it.
    const now = new Date();
    const signoffs: { role: "REPORTING_STAFF" | "COUNSELOR" | "LEADERSHIP"; signerName: string; userId?: string }[] = [];
    if (input.reportingStaffSignerName) {
      signoffs.push({ role: "REPORTING_STAFF", signerName: input.reportingStaffSignerName });
    }
    if (input.counselorSignerName) {
      signoffs.push({ role: "COUNSELOR", signerName: input.counselorSignerName, userId });
    }
    if (input.leadershipSignerName) {
      signoffs.push({ role: "LEADERSHIP", signerName: input.leadershipSignerName });
    }
    await tx.incidentSignoff.deleteMany({ where: { incidentId: id } });
    if (signoffs.length) {
      await tx.incidentSignoff.createMany({
        data: signoffs.map((s) => ({
          incidentId: id,
          role: s.role,
          signerName: s.signerName,
          userId: s.userId,
          signedAt: now,
        })),
      });
    }

    // Only create a follow-up if one isn't already linked to this incident.
    if (input.parentContactRequired === "on" && input.followUpTitle && input.followUpDueDate) {
      const existingFollowUp = await tx.followUp.findFirst({ where: { relatedIncidentId: id } });
      if (!existingFollowUp) {
        await tx.followUp.create({
          data: {
            studentId: input.primaryStudentId,
            createdByUserId: userId,
            relatedIncidentId: id,
            title: input.followUpTitle,
            dueDate: new Date(input.followUpDueDate),
            priority: "HIGH",
            status: "PENDING",
          },
        });
      }
    }

    await logAudit(tx, {
      userId,
      action: "UPDATE",
      entityType: "incident",
      entityId: incident.id,
    });

    return incident;
  });
}

export async function archiveIncident(id: string, deletedBy: string) {
  return db.$transaction(async (tx) => {
    const incident = await tx.incident.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });

    await logAudit(tx, {
      userId: deletedBy,
      action: "ARCHIVE",
      entityType: "incident",
      entityId: incident.id,
    });

    return incident;
  });
}

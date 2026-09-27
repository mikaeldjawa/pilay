import { db } from "@/lib/db";
import { logAudit } from "@/modules/audit/audit.service";
import type {
  CreateGuardianInput,
  CreateParentContactInput,
  UpdateGuardianInput,
} from "@/modules/guardians/guardian.schema";

export class GuardianServiceError extends Error {}

export async function createGuardianForStudent(input: CreateGuardianInput, actorUserId: string) {
  return db.$transaction(async (tx) => {
    const guardian = await tx.guardian.create({
      data: {
        fullName: input.fullName,
        relationship: input.relationship || null,
        phone: input.phone || null,
        email: input.email || null,
      },
    });

    await tx.studentGuardian.create({
      data: {
        studentId: input.studentId,
        guardianId: guardian.id,
        isPrimaryContact: input.isPrimaryContact === "on",
        isEmergencyContact: input.isEmergencyContact === "on",
      },
    });

    await logAudit(tx, {
      userId: actorUserId,
      action: "CREATE",
      entityType: "guardian",
      entityId: guardian.id,
      metadata: { studentId: input.studentId },
    });

    return guardian;
  });
}

export async function updateGuardian(guardianId: string, input: UpdateGuardianInput, actorUserId: string) {
  return db.$transaction(async (tx) => {
    const guardian = await tx.guardian.update({
      where: { id: guardianId },
      data: {
        fullName: input.fullName,
        relationship: input.relationship || null,
        phone: input.phone || null,
        email: input.email || null,
      },
    });

    await tx.studentGuardian.update({
      where: { studentId_guardianId: { studentId: input.studentId, guardianId } },
      data: {
        isPrimaryContact: input.isPrimaryContact === "on",
        isEmergencyContact: input.isEmergencyContact === "on",
      },
    });

    await logAudit(tx, {
      userId: actorUserId,
      action: "UPDATE",
      entityType: "guardian",
      entityId: guardian.id,
      metadata: { studentId: input.studentId },
    });

    return guardian;
  });
}

export async function createParentContact(input: CreateParentContactInput, counselorId: string) {
  return db.$transaction(async (tx) => {
    const contact = await tx.parentContact.create({
      data: {
        studentId: input.studentId,
        guardianId: input.guardianId,
        counselorId,
        method: input.method,
        contactDate: new Date(input.contactDate),
        reason: input.reason,
        summary: input.summary,
        outcome: input.outcome || null,
        followUpRequired: input.followUpRequired === "on",
        relatedIncidentId: input.relatedIncidentId || null,
        relatedSessionId: input.relatedSessionId || null,
      },
    });

    // Follow-up enforcement, matching the pattern already used by Counseling
    // Session and Incident: a contact flagged as needing follow-up must not
    // commit without a linked follow_ups row.
    if (input.followUpRequired === "on") {
      if (!input.followUpTitle || !input.followUpDueDate) {
        throw new GuardianServiceError(
          "Follow-up title and due date are required when follow-up is marked required.",
        );
      }
      await tx.followUp.create({
        data: {
          studentId: input.studentId,
          createdByUserId: counselorId,
          relatedIncidentId: input.relatedIncidentId || null,
          relatedSessionId: input.relatedSessionId || null,
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
      entityType: "parent_contact",
      entityId: contact.id,
    });

    return contact;
  });
}

export async function archiveGuardian(id: string, deletedBy: string) {
  return db.$transaction(async (tx) => {
    const guardian = await tx.guardian.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });

    await logAudit(tx, {
      userId: deletedBy,
      action: "ARCHIVE",
      entityType: "guardian",
      entityId: guardian.id,
    });

    return guardian;
  });
}

export async function archiveParentContact(id: string, deletedBy: string) {
  return db.$transaction(async (tx) => {
    const contact = await tx.parentContact.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });

    await logAudit(tx, {
      userId: deletedBy,
      action: "ARCHIVE",
      entityType: "parent_contact",
      entityId: contact.id,
    });

    return contact;
  });
}

import { db } from "@/lib/db";
import { logAudit } from "@/modules/audit/audit.service";
import type { CreateFollowUpInput } from "@/modules/follow-ups/follow-up.schema";

export async function createFollowUp(input: CreateFollowUpInput, createdByUserId: string) {
  return db.$transaction(async (tx) => {
    const followUp = await tx.followUp.create({
      data: {
        studentId: input.studentId,
        createdByUserId,
        title: input.title,
        description: input.description || null,
        priority: input.priority,
        dueDate: new Date(input.dueDate),
        status: "PENDING",
      },
    });

    await logAudit(tx, {
      userId: createdByUserId,
      action: "CREATE",
      entityType: "follow_up",
      entityId: followUp.id,
    });

    return followUp;
  });
}

export async function completeFollowUp(id: string, completedByUserId: string, notes?: string) {
  return db.$transaction(async (tx) => {
    const followUp = await tx.followUp.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        completedByUserId,
        completedNotes: notes || null,
      },
    });

    await logAudit(tx, {
      userId: completedByUserId,
      action: "UPDATE",
      entityType: "follow_up",
      entityId: followUp.id,
      metadata: { status: "COMPLETED" },
    });

    return followUp;
  });
}

import { db } from "@/lib/db";
import type { Prisma, AuditAction } from "@/generated/prisma/client";

type AuditClient = Prisma.TransactionClient | typeof db;

export async function logAudit(
  client: AuditClient,
  params: {
    userId: string | null;
    action: AuditAction;
    entityType: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
  },
) {
  await client.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}

export type AuditLogSortKey = "date";

export type AuditLogListFilters = {
  entityType?: string;
  action?: AuditAction;
  dir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export async function listAuditLog(filters: AuditLogListFilters) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 25;
  const dir = filters.dir ?? "desc";
  const where = {
    ...(filters.entityType ? { entityType: filters.entityType } : {}),
    ...(filters.action ? { action: filters.action } : {}),
  };

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: dir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.auditLog.count({ where }),
  ]);

  return { logs, total, page, pageSize };
}

export async function listAuditLogEntityTypes() {
  const rows = await db.auditLog.findMany({ distinct: ["entityType"], select: { entityType: true } });
  return rows.map((r) => r.entityType);
}

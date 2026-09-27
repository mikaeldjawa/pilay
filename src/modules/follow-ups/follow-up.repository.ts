import { db } from "@/lib/db";
import type { FollowUpPriority, FollowUpStatus, Prisma } from "@/generated/prisma/client";
import { studentNameSearchFilter } from "@/lib/utils";

export type FollowUpSortKey = "due" | "priority" | "status";

export type FollowUpListFilters = {
  studentId?: string;
  search?: string;
  status?: FollowUpStatus;
  priority?: FollowUpPriority;
  sort?: FollowUpSortKey;
  dir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

function followUpOrderBy(sort: FollowUpSortKey | undefined, dir: "asc" | "desc"): Prisma.FollowUpOrderByWithRelationInput[] {
  switch (sort) {
    case "priority":
      return [{ priority: dir }, { dueDate: "asc" }];
    case "status":
      return [{ status: dir }, { dueDate: "asc" }];
    case "due":
    default:
      return [{ dueDate: dir }];
  }
}

export async function listFollowUps(params: FollowUpListFilters) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 25;
  const dir = params.dir ?? "asc";
  const where = {
    deletedAt: null,
    ...(params.studentId ? { studentId: params.studentId } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.priority ? { priority: params.priority } : {}),
    ...(params.search
      ? {
          OR: [
            { title: { contains: params.search, mode: "insensitive" as const } },
            { student: studentNameSearchFilter(params.search) },
          ],
        }
      : {}),
  };

  const [followUps, total] = await Promise.all([
    db.followUp.findMany({
      where,
      include: { student: true },
      orderBy: followUpOrderBy(params.sort, dir),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.followUp.count({ where }),
  ]);

  return { followUps, total, page, pageSize };
}

export async function findFollowUpById(id: string) {
  return db.followUp.findUnique({ where: { id }, include: { student: true } });
}

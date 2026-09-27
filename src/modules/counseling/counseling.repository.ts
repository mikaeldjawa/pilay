import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import type { Prisma, RiskLevel, SessionStatus } from "@/generated/prisma/client";
import { studentNameSearchFilter } from "@/lib/utils";

export type CounselingSortKey = "date" | "risk" | "status";

export type CounselingListFilters = {
  studentId?: string;
  search?: string;
  categoryId?: string;
  riskLevel?: RiskLevel;
  status?: SessionStatus;
  sort?: CounselingSortKey;
  dir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

function counselingOrderBy(
  sort: CounselingSortKey | undefined,
  dir: "asc" | "desc",
): Prisma.CounselingSessionOrderByWithRelationInput[] {
  switch (sort) {
    case "risk":
      return [{ riskLevel: dir }, { sessionDate: "desc" }];
    case "status":
      return [{ status: dir }, { sessionDate: "desc" }];
    case "date":
    default:
      return [{ sessionDate: dir }];
  }
}

export async function listCounselingSessions(params: CounselingListFilters) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 25;
  const dir = params.dir ?? "desc";
  const where = {
    deletedAt: null,
    ...(params.studentId ? { studentId: params.studentId } : {}),
    ...(params.categoryId ? { counselingCategoryId: params.categoryId } : {}),
    ...(params.riskLevel ? { riskLevel: params.riskLevel } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.search
      ? {
          OR: [
            { student: studentNameSearchFilter(params.search) },
            { subjectStudent: studentNameSearchFilter(params.search) },
          ],
        }
      : {}),
  };

  const [sessions, total] = await Promise.all([
    db.counselingSession.findMany({
      where,
      include: {
        student: true,
        subjectStudent: true,
        counselingCategory: true,
        counselor: true,
      },
      orderBy: counselingOrderBy(params.sort, dir),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.counselingSession.count({ where }),
  ]);

  return { sessions, total, page, pageSize };
}

export async function findCounselingSessionById(id: string) {
  return db.counselingSession.findUnique({
    where: { id },
    include: {
      student: true,
      subjectStudent: true,
      counselingCategory: true,
      counselor: true,
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
}

export const listCounselingCategories = unstable_cache(
  async () => db.counselingCategory.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ["counseling-categories"],
  { revalidate: 60, tags: ["counseling-categories"] },
);

export async function listRiskDimensions() {
  return db.riskDimension.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
}

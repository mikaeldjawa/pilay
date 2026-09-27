import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export type TeachingPlanSortKey = "created" | "semester";

export type TeachingPlanListFilters = {
  academicYearId?: string;
  semester?: number;
  classId?: string;
  subjectId?: string;
  search?: string;
  sort?: TeachingPlanSortKey;
  dir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export async function listTeachingPlans(params: TeachingPlanListFilters) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 25;
  const dir = params.dir ?? "desc";
  const where: Prisma.TeachingPlanWhereInput = {
    deletedAt: null,
    ...(params.academicYearId ? { academicYearId: params.academicYearId } : {}),
    ...(params.semester ? { semester: params.semester } : {}),
    ...(params.classId ? { classId: params.classId } : {}),
    ...(params.subjectId ? { subjectId: params.subjectId } : {}),
    ...(params.search
      ? {
          OR: [
            { subject: { name: { contains: params.search, mode: "insensitive" } } },
            { class: { name: { contains: params.search, mode: "insensitive" } } },
            { title: { contains: params.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.TeachingPlanOrderByWithRelationInput[] =
    params.sort === "semester"
      ? [{ semester: dir }, { createdAt: "desc" }]
      : [{ createdAt: dir }];

  const [plans, total] = await Promise.all([
    db.teachingPlan.findMany({
      where,
      include: {
        academicYear: true,
        class: { include: { grade: true } },
        subject: true,
        teacher: true,
        _count: { select: { weeks: true } },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.teachingPlan.count({ where }),
  ]);

  // Planned-week counts computed in a single grouped query to avoid N+1. A
  // week counts as "planned" once it has a topic set.
  const ids = plans.map((p) => p.id);
  const plannedGroups = ids.length
    ? await db.teachingPlanWeek.groupBy({
        by: ["teachingPlanId"],
        where: { teachingPlanId: { in: ids }, topic: { not: null } },
        _count: { _all: true },
      })
    : [];
  const plannedById = new Map(
    plannedGroups.map((g) => [g.teachingPlanId, g._count._all]),
  );

  const plansWithProgress = plans.map((p) => ({
    ...p,
    plannedWeeks: plannedById.get(p.id) ?? 0,
    totalWeeks: p._count.weeks,
  }));

  return { plans: plansWithProgress, total, page, pageSize };
}

export async function findTeachingPlanById(id: string) {
  return db.teachingPlan.findFirst({
    where: { id, deletedAt: null },
    include: {
      academicYear: true,
      class: { include: { grade: true } },
      subject: true,
      teacher: true,
      weeks: {
        orderBy: { weekNumber: "asc" },
        include: {
          _count: {
            select: {
              lessons: true,
              materials: { where: { deletedAt: null } },
            },
          },
        },
      },
    },
  });
}

export async function findWeekById(weekId: string) {
  return db.teachingPlanWeek.findUnique({
    where: { id: weekId },
    include: {
      teachingPlan: {
        include: {
          subject: true,
          class: { include: { grade: true } },
          academicYear: true,
        },
      },
      lessons: { orderBy: { sequenceOrder: "asc" } },
      materials: { where: { deletedAt: null }, orderBy: { createdAt: "asc" } },
    },
  });
}

export const listSubjects = unstable_cache(
  async () => db.subject.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ["subjects"],
  { revalidate: 60, tags: ["subjects"] },
);

export async function listAcademicYears() {
  return db.academicYear.findMany({ orderBy: { startDate: "desc" } });
}

export async function listClasses() {
  return db.class.findMany({
    include: { grade: true, academicYear: true },
    orderBy: [{ academicYear: { startDate: "desc" } }, { name: "asc" }],
  });
}

export async function listTeachers() {
  return db.user.findMany({
    where: { deletedAt: null, isActive: true },
    orderBy: { fullName: "asc" },
  });
}

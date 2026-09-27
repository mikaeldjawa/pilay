import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import type { Prisma, StudentStatus } from "@/generated/prisma/client";
import { studentNameSearchFilter } from "@/lib/utils";

export type StudentSortKey = "name" | "studentId" | "status";

export type StudentListFilters = {
  search?: string;
  gradeId?: string;
  classId?: string;
  status?: StudentStatus;
  archived?: boolean;
  sort?: StudentSortKey;
  dir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

function studentOrderBy(sort: StudentSortKey | undefined, dir: "asc" | "desc"): Prisma.StudentOrderByWithRelationInput[] {
  switch (sort) {
    case "studentId":
      return [{ studentId: dir }];
    case "status":
      return [{ status: dir }, { firstName: "asc" }];
    case "name":
    default:
      return [{ firstName: dir }, { lastName: dir }];
  }
}

export async function listStudents(filters: StudentListFilters) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 25;
  const dir = filters.dir ?? "asc";

  const where = {
    deletedAt: filters.archived ? { not: null } : null,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.search
      ? {
          OR: [
            studentNameSearchFilter(filters.search),
            { studentId: { contains: filters.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(filters.gradeId || filters.classId
      ? {
          enrollments: {
            some: {
              endDate: null,
              ...(filters.gradeId ? { gradeId: filters.gradeId } : {}),
              ...(filters.classId ? { classId: filters.classId } : {}),
            },
          },
        }
      : {}),
  };

  const [students, total] = await Promise.all([
    db.student.findMany({
      where,
      include: {
        enrollments: {
          where: { endDate: null },
          include: { grade: true, class: true },
          take: 1,
        },
      },
      orderBy: studentOrderBy(filters.sort, dir),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.student.count({ where }),
  ]);

  return { students, total, page, pageSize };
}

// For populating a student picker (dropdown/combobox) — name + studentId
// only, no enrollment include, no pagination cap. Much lighter than
// listStudents(), which fetches full rows with grade/class joins for a
// paginated table.
export async function listStudentOptions() {
  return db.student.findMany({
    where: { deletedAt: null },
    select: { id: true, firstName: true, middleName: true, lastName: true, studentId: true },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });
}

export async function findStudentById(id: string) {
  return db.student.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: { grade: true, class: true, academicYear: true },
        orderBy: { startDate: "desc" },
      },
    },
  });
}

export async function findStudentByStudentId(studentId: string) {
  return db.student.findUnique({ where: { studentId } });
}

export async function getCurrentAcademicYear() {
  return db.academicYear.findFirst({ where: { isCurrent: true } });
}

export const listGrades = unstable_cache(
  async () => db.grade.findMany({ orderBy: { level: "asc" } }),
  ["grades"],
  { revalidate: 60, tags: ["grades"] },
);

export const listClasses = unstable_cache(
  async (academicYearId?: string) =>
    db.class.findMany({
      where: academicYearId ? { academicYearId } : undefined,
      include: { grade: true },
      orderBy: { name: "asc" },
    }),
  ["classes"],
  { revalidate: 60, tags: ["classes"] },
);

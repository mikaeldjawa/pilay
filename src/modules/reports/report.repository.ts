import { db } from "@/lib/db";
import type { Prisma, ReportStatus, ReportType } from "@/generated/prisma/client";
import { studentNameSearchFilter } from "@/lib/utils";

export type ReportSortKey = "date" | "number";

export type GeneratedReportListFilters = {
  search?: string;
  reportType?: ReportType;
  status?: ReportStatus;
  sort?: ReportSortKey;
  dir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

function reportOrderBy(sort: ReportSortKey | undefined, dir: "asc" | "desc"): Prisma.GeneratedReportOrderByWithRelationInput[] {
  switch (sort) {
    case "number":
      return [{ reportNumber: dir }];
    case "date":
    default:
      return [{ createdAt: dir }];
  }
}

export async function listGeneratedReports(filters: GeneratedReportListFilters) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 25;
  const dir = filters.dir ?? "desc";
  const where = {
    ...(filters.reportType ? { reportType: filters.reportType } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.search
      ? {
          OR: [
            { reportNumber: { contains: filters.search, mode: "insensitive" as const } },
            { documentTitle: { contains: filters.search, mode: "insensitive" as const } },
            { student: studentNameSearchFilter(filters.search) },
          ],
        }
      : {}),
  };

  const [reports, total] = await Promise.all([
    db.generatedReport.findMany({
      where,
      include: { student: true },
      orderBy: reportOrderBy(filters.sort, dir),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.generatedReport.count({ where }),
  ]);

  return { reports, total, page, pageSize };
}

export async function findGeneratedReportById(id: string) {
  return db.generatedReport.findUnique({ where: { id }, include: { student: true } });
}

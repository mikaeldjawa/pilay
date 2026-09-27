import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import type { IncidentStatus, Prisma } from "@/generated/prisma/client";
import { formatStudentName, studentNameSearchFilter } from "@/lib/utils";
import { listBehaviorRecordsFiltered } from "@/modules/behavior/behavior.repository";
import { getChronicStudentIds } from "@/modules/behavior/behavior.service";

export type IncidentSortKey = "date" | "status" | "number";

export type IncidentListFilters = {
  search?: string;
  categoryId?: string;
  status?: IncidentStatus;
  sort?: IncidentSortKey;
  dir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

function incidentOrderBy(sort: IncidentSortKey | undefined, dir: "asc" | "desc"): Prisma.IncidentOrderByWithRelationInput[] {
  switch (sort) {
    case "status":
      return [{ status: dir }, { incidentDate: "desc" }];
    case "number":
      return [{ incidentNumber: dir }];
    case "date":
    default:
      return [{ incidentDate: dir }];
  }
}

export async function listIncidents(params: IncidentListFilters) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 25;
  const dir = params.dir ?? "desc";
  const where = {
    deletedAt: null,
    ...(params.categoryId ? { incidentCategoryId: params.categoryId } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.search
      ? {
          OR: [
            { incidentNumber: { contains: params.search, mode: "insensitive" as const } },
            { primaryStudent: studentNameSearchFilter(params.search) },
          ],
        }
      : {}),
  };

  const [incidents, total] = await Promise.all([
    db.incident.findMany({
      where,
      include: { primaryStudent: true, incidentCategory: true },
      orderBy: incidentOrderBy(params.sort, dir),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.incident.count({ where }),
  ]);

  return { incidents, total, page, pageSize };
}

export async function findIncidentById(id: string) {
  return db.incident.findUnique({
    where: { id },
    include: {
      primaryStudent: true,
      incidentCategory: true,
      reportedBy: true,
      narrative: true,
      response: true,
      participants: { include: { student: true } },
      witnesses: true,
      categorySelections: { include: { incidentCategory: true } },
      signoffs: true,
      parentContacts: {
        where: { deletedAt: null },
        include: { guardian: true },
        orderBy: { contactDate: "desc" },
      },
    },
  });
}

export const listIncidentCategories = unstable_cache(
  async () => db.incidentCategory.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ["incident-categories"],
  { revalidate: 60, tags: ["incident-categories"] },
);

export type IncidentFeedKind = "major" | "minor";

export type IncidentFeedRow = {
  kind: IncidentFeedKind;
  id: string;
  number: string | null;
  date: Date;
  studentId: string;
  studentName: string;
  category: string;
  status: IncidentStatus | null;
  href: string;
  // Cross-row flags on the *student*, not this specific incident/log — lets
  // the list surface "this student already has a major incident on record"
  // or "this student is currently in a chronic minor pattern (3+/14d)" even
  // while looking at an unrelated row of theirs.
  hasMajorIncidentHistory: boolean;
  isChronicMinor: boolean;
};

export type IncidentFeedFilters = {
  search?: string;
  incidentType?: "major" | "minor";
  categoryId?: string;
  status?: IncidentStatus;
  sort?: IncidentSortKey;
  dir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

function toMajorFeedRow(incident: Awaited<ReturnType<typeof listIncidents>>["incidents"][number]): IncidentFeedRow {
  return {
    kind: "major",
    id: incident.id,
    number: incident.incidentNumber,
    date: incident.incidentDate,
    studentId: incident.primaryStudentId,
    studentName: formatStudentName(incident.primaryStudent),
    category: incident.incidentCategory.name,
    status: incident.status,
    href: `/incidents/${incident.id}`,
    hasMajorIncidentHistory: false,
    isChronicMinor: false,
  };
}

function toMinorFeedRow(record: Awaited<ReturnType<typeof listBehaviorRecordsFiltered>>["records"][number]): IncidentFeedRow {
  return {
    kind: "minor",
    id: record.id,
    number: null,
    date: record.recordDate,
    studentId: record.studentId,
    studentName: formatStudentName(record.student),
    category: [...record.categories.map((c) => c.behaviorCategory.name), record.otherBehaviorText]
      .filter(Boolean)
      .join(", "),
    status: null,
    href: `/students/${record.studentId}`,
    hasMajorIncidentHistory: false,
    isChronicMinor: false,
  };
}

// Enriches a page of feed rows with per-student risk flags — cheap because
// it only ever queries for the handful of distinct students visible on the
// current page, not the whole table.
async function attachRiskFlags(rows: IncidentFeedRow[]): Promise<IncidentFeedRow[]> {
  const studentIds = Array.from(new Set(rows.map((r) => r.studentId)));
  if (studentIds.length === 0) return rows;

  const [majorHistoryRows, chronicStudentIds] = await Promise.all([
    db.incident.findMany({
      where: { primaryStudentId: { in: studentIds }, deletedAt: null },
      select: { primaryStudentId: true },
      distinct: ["primaryStudentId"],
    }),
    getChronicStudentIds(studentIds),
  ]);
  const majorHistoryStudentIds = new Set(majorHistoryRows.map((r) => r.primaryStudentId));

  return rows.map((row) => ({
    ...row,
    hasMajorIncidentHistory: majorHistoryStudentIds.has(row.studentId),
    isChronicMinor: chronicStudentIds.has(row.studentId),
  }));
}

function mergeFeedRowsByDate(major: IncidentFeedRow[], minor: IncidentFeedRow[], dir: "asc" | "desc"): IncidentFeedRow[] {
  const merged: IncidentFeedRow[] = [];
  let i = 0;
  let j = 0;
  while (i < major.length && j < minor.length) {
    const cmp = major[i].date.getTime() - minor[j].date.getTime();
    const majorFirst = dir === "asc" ? cmp <= 0 : cmp >= 0;
    merged.push(majorFirst ? major[i++] : minor[j++]);
  }
  while (i < major.length) merged.push(major[i++]);
  while (j < minor.length) merged.push(minor[j++]);
  return merged;
}

export async function listIncidentFeed(params: IncidentFeedFilters): Promise<{
  rows: IncidentFeedRow[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 25;
  const dir = params.dir ?? "desc";
  const includeMajor = params.incidentType !== "minor";
  const includeMinor = params.incidentType !== "major" && !params.status;

  if (includeMajor && !includeMinor) {
    const { incidents, total } = await listIncidents({
      search: params.search,
      categoryId: params.categoryId,
      status: params.status,
      sort: params.sort,
      dir,
      page,
      pageSize,
    });
    return { rows: await attachRiskFlags(incidents.map(toMajorFeedRow)), total, page, pageSize };
  }

  if (includeMinor && !includeMajor) {
    const { records, total } = await listBehaviorRecordsFiltered({
      search: params.search,
      dir,
      page,
      pageSize,
    });
    return { rows: await attachRiskFlags(records.map(toMinorFeedRow)), total, page, pageSize };
  }

  if (!includeMajor && !includeMinor) {
    return { rows: [], total: 0, page, pageSize };
  }

  const take = page * pageSize;
  const majorWhere = {
    deletedAt: null,
    ...(params.categoryId ? { incidentCategoryId: params.categoryId } : {}),
    ...(params.search
      ? {
          OR: [
            { incidentNumber: { contains: params.search, mode: "insensitive" as const } },
            { primaryStudent: studentNameSearchFilter(params.search) },
          ],
        }
      : {}),
  };
  const minorWhere = {
    deletedAt: null,
    incidentId: null,
    ...(params.search ? { student: studentNameSearchFilter(params.search) } : {}),
  };

  const [majorIncidents, minorRecords, majorTotal, minorTotal] = await Promise.all([
    db.incident.findMany({
      where: majorWhere,
      include: { primaryStudent: true, incidentCategory: true },
      orderBy: [{ incidentDate: dir }],
      take,
    }),
    db.behaviorRecord.findMany({
      where: minorWhere,
      include: {
        student: true,
        categories: { include: { behaviorCategory: true } },
        actions: { include: { actionCode: true } },
      },
      orderBy: { recordDate: dir },
      take,
    }),
    db.incident.count({ where: majorWhere }),
    db.behaviorRecord.count({ where: minorWhere }),
  ]);

  const merged = mergeFeedRowsByDate(majorIncidents.map(toMajorFeedRow), minorRecords.map(toMinorFeedRow), dir);
  const start = (page - 1) * pageSize;
  const rows = merged.slice(start, start + pageSize);
  const total = majorTotal + minorTotal;

  return { rows: await attachRiskFlags(rows), total, page, pageSize };
}

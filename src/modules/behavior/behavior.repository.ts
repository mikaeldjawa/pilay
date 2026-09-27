import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { studentNameSearchFilter } from "@/lib/utils";

export const listBehaviorCategories = unstable_cache(
  async () => db.behaviorCategory.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ["behavior-categories"],
  { revalidate: 60, tags: ["behavior-categories"] },
);

export const listActionCodes = unstable_cache(
  async () => db.actionCode.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ["action-codes"],
  { revalidate: 60, tags: ["action-codes"] },
);

const behaviorRecordInclude = {
  student: true,
  categories: { include: { behaviorCategory: true } },
  actions: { include: { actionCode: true } },
} as const;

export async function listBehaviorRecords(params: { studentId?: string; page?: number; pageSize?: number }) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 50;
  const where = { deletedAt: null, ...(params.studentId ? { studentId: params.studentId } : {}) };

  const [records, total] = await Promise.all([
    db.behaviorRecord.findMany({
      where,
      include: behaviorRecordInclude,
      orderBy: { recordDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.behaviorRecord.count({ where }),
  ]);

  return { records, total, page, pageSize };
}

export type BehaviorRecordListFilters = {
  search?: string;
  dir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export async function listBehaviorRecordsFiltered(params: BehaviorRecordListFilters) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 25;
  const dir = params.dir ?? "desc";
  const where = {
    deletedAt: null,
    incidentId: null,
    ...(params.search ? { student: studentNameSearchFilter(params.search) } : {}),
  };

  const [records, total] = await Promise.all([
    db.behaviorRecord.findMany({
      where,
      include: behaviorRecordInclude,
      orderBy: { recordDate: dir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.behaviorRecord.count({ where }),
  ]);

  return { records, total, page, pageSize };
}

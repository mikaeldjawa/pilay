import { randomUUID } from "node:crypto";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { logAudit } from "@/modules/audit/audit.service";
import * as storage from "@/modules/documents/storage.service";
import type { UploadDocumentInput } from "@/modules/documents/document.schema";
import type { Prisma } from "@/generated/prisma/client";

export class DocumentServiceError extends Error {}

export const MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024;

export const listDocumentCategories = unstable_cache(
  async () => db.documentCategory.findMany({ orderBy: { name: "asc" } }),
  ["document-categories"],
  { revalidate: 60, tags: ["document-categories"] },
);

export type DocumentSortKey = "date" | "title";

export type DocumentListFilters = {
  studentId?: string;
  search?: string;
  documentCategoryId?: string;
  sort?: DocumentSortKey;
  dir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

function documentOrderBy(sort: DocumentSortKey | undefined, dir: "asc" | "desc"): Prisma.DocumentOrderByWithRelationInput[] {
  switch (sort) {
    case "title":
      return [{ title: dir }];
    case "date":
    default:
      return [{ createdAt: dir }];
  }
}

export async function listDocuments(params: DocumentListFilters) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 25;
  const dir = params.dir ?? "desc";
  const where = {
    deletedAt: null,
    ...(params.studentId ? { studentId: params.studentId } : {}),
    ...(params.documentCategoryId ? { documentCategoryId: params.documentCategoryId } : {}),
    ...(params.search
      ? {
          OR: [
            { title: { contains: params.search, mode: "insensitive" as const } },
            { fileName: { contains: params.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [documents, total] = await Promise.all([
    db.document.findMany({
      where,
      include: { documentCategory: true, student: true },
      orderBy: documentOrderBy(params.sort, dir),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.document.count({ where }),
  ]);

  return { documents, total, page, pageSize };
}

export async function findDocumentById(id: string) {
  return db.document.findUnique({ where: { id } });
}

export async function uploadDocument(
  input: UploadDocumentInput,
  file: { name: string; type: string; size: number; buffer: Buffer },
  uploadedByUserId: string,
) {
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new DocumentServiceError(
      `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum size is ${MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)}MB.`,
    );
  }

  const documentId = randomUUID();
  const storageKey = `documents/${documentId}/${file.name}`;
  await storage.put(storageKey, file.buffer);

  return db.$transaction(async (tx) => {
    const document = await tx.document.create({
      data: {
        id: documentId,
        studentId: input.studentId || null,
        documentCategoryId: input.documentCategoryId,
        title: input.title,
        fileName: file.name,
        storageKey,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
        uploadedByUserId,
      },
    });

    await logAudit(tx, {
      userId: uploadedByUserId,
      action: "CREATE",
      entityType: "document",
      entityId: document.id,
    });

    return document;
  });
}

export async function downloadDocument(id: string, userId: string) {
  const document = await db.document.findUniqueOrThrow({ where: { id } });
  const data = await storage.get(document.storageKey);

  await logAudit(db, {
    userId,
    action: "DOWNLOAD",
    entityType: "document",
    entityId: document.id,
  });

  return { document, data };
}

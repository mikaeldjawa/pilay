import ExcelJS from "exceljs";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { parsedImportRowSchema, type ParsedImportRow } from "@/modules/students/student-import.schema";

type ColumnKey = "studentId" | "name" | "className" | "gender" | "academicYearName";

// Accepts a couple of reasonable header spellings per column — "Class" is
// the field name per the product ask, but "Classes" is accepted too since
// spreadsheets in the wild are inconsistent about singular/plural headers.
const COLUMN_ALIASES: Record<string, ColumnKey> = {
  "student id": "studentId",
  "studentid": "studentId",
  "name": "name",
  "class": "className",
  "classes": "className",
  "gender": "gender",
  "academic year": "academicYearName",
  "academicyear": "academicYearName",
};

const REQUIRED_COLUMNS: ColumnKey[] = ["studentId", "name", "className", "academicYearName"];

export type ParseError = { row: number; message: string };

export type ParseResult = {
  rows: ParsedImportRow[];
  parseErrors: ParseError[];
};

function cellToText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    if ("richText" in value) return value.richText.map((r) => r.text).join("");
    if ("text" in value) return String(value.text ?? "");
    if ("result" in value) return String(value.result ?? "");
    return "";
  }
  return String(value).trim();
}

export async function parseStudentImportFile(buffer: Buffer): Promise<ParseResult> {
  const workbook = new ExcelJS.Workbook();
  // exceljs's bundled type defs pin an older, structurally-incompatible
  // `Buffer` shape — a well-known type-defs lag, not a real runtime concern
  // (Buffer is Buffer at runtime regardless).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await workbook.xlsx.load(buffer as any);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    return { rows: [], parseErrors: [{ row: 0, message: "The workbook has no sheets." }] };
  }

  const columnIndex: Partial<Record<ColumnKey, number>> = {};
  worksheet.getRow(1).eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const key = cellToText(cell.value).toLowerCase();
    const mapped = COLUMN_ALIASES[key];
    if (mapped) columnIndex[mapped] = colNumber;
  });

  const missing = REQUIRED_COLUMNS.filter((key) => columnIndex[key] === undefined);
  if (missing.length > 0) {
    return {
      rows: [],
      parseErrors: [{ row: 1, message: `Missing required column(s): ${missing.join(", ")}` }],
    };
  }

  const rows: ParsedImportRow[] = [];
  const parseErrors: ParseError[] = [];

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;

    const cellText = (key: ColumnKey) => {
      const idx = columnIndex[key];
      return idx ? cellToText(row.getCell(idx).value) : "";
    };

    const candidate = {
      rowNumber,
      studentId: cellText("studentId"),
      name: cellText("name"),
      className: cellText("className"),
      gender: cellText("gender") || undefined,
      academicYearName: cellText("academicYearName"),
    };

    // Skip fully-blank rows (trailing empty rows are common in real sheets).
    if (!candidate.studentId && !candidate.name && !candidate.className && !candidate.academicYearName) {
      return;
    }

    const parsed = parsedImportRowSchema.safeParse(candidate);
    if (!parsed.success) {
      parseErrors.push({ row: rowNumber, message: parsed.error.issues[0]?.message ?? "Invalid row." });
      return;
    }
    rows.push(parsed.data);
  });

  return { rows, parseErrors };
}

function splitName(fullName: string): { firstName: string; middleName?: string; lastName?: string } | null {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.length === 1) return { firstName: parts[0] };

  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  const middleName = parts.length > 2 ? parts.slice(1, -1).join(" ") : undefined;
  return { firstName, middleName, lastName };
}

export type ImportRowResult =
  | { row: number; status: "created"; studentId: string }
  | { row: number; status: "error"; message: string };

export async function importStudentRow(row: ParsedImportRow): Promise<ImportRowResult> {
  const split = splitName(row.name);
  if (!split) {
    return { row: row.rowNumber, status: "error", message: `"${row.name}" must include at least a name.` };
  }

  const academicYear = await db.academicYear.findFirst({ where: { name: row.academicYearName } });
  if (!academicYear) {
    return { row: row.rowNumber, status: "error", message: `Academic year "${row.academicYearName}" not found.` };
  }

  const cls = await db.class.findUnique({
    where: { name_academicYearId: { name: row.className, academicYearId: academicYear.id } },
  });
  if (!cls) {
    return {
      row: row.rowNumber,
      status: "error",
      message: `Class "${row.className}" not found in academic year "${row.academicYearName}".`,
    };
  }

  try {
    const student = await db.$transaction(async (tx) => {
      const created = await tx.student.create({
        data: {
          studentId: row.studentId,
          firstName: split.firstName,
          middleName: split.middleName ?? null,
          lastName: split.lastName ?? null,
          gender: row.gender || null,
          status: "ACTIVE",
        },
      });

      await tx.studentEnrollment.create({
        data: {
          studentId: created.id,
          academicYearId: academicYear.id,
          gradeId: cls.gradeId,
          classId: cls.id,
          startDate: new Date(),
          status: "ACTIVE",
        },
      });

      return created;
    });

    return { row: row.rowNumber, status: "created", studentId: student.studentId };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { row: row.rowNumber, status: "error", message: `Student ID "${row.studentId}" already exists.` };
    }
    throw error;
  }
}

export async function importStudents(rows: ParsedImportRow[]) {
  const results: ImportRowResult[] = [];
  for (const row of rows) {
    results.push(await importStudentRow(row));
  }
  const created = results.filter((r) => r.status === "created").length;
  return { total: rows.length, created, failed: rows.length - created, results };
}

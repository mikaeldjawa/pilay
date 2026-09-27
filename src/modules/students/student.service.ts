import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import {
  findStudentById,
  findStudentByStudentId,
  getCurrentAcademicYear,
} from "@/modules/students/student.repository";
import type { CreateStudentInput, UpdateStudentInput } from "@/modules/students/student.schema";

export class StudentServiceError extends Error {}

function toDateOrUndefined(value: string | undefined) {
  return value ? new Date(value) : undefined;
}

export async function createStudent(input: CreateStudentInput) {
  const existing = await findStudentByStudentId(input.studentId);
  if (existing) {
    throw new StudentServiceError(`Student ID "${input.studentId}" is already in use.`);
  }

  const academicYear = await getCurrentAcademicYear();
  if (!academicYear) {
    throw new StudentServiceError(
      "No current academic year is configured. Set one up in Settings first.",
    );
  }

  try {
    return await db.$transaction(async (tx) => {
      const student = await tx.student.create({
        data: {
          studentId: input.studentId,
          firstName: input.firstName,
          middleName: input.middleName || undefined,
          lastName: input.lastName || undefined,
          dateOfBirth: toDateOrUndefined(input.dateOfBirth),
          gender: input.gender || undefined,
          notes: input.notes || undefined,
          status: "ACTIVE",
        },
      });

      await tx.studentEnrollment.create({
        data: {
          studentId: student.id,
          academicYearId: academicYear.id,
          gradeId: input.gradeId,
          classId: input.classId,
          startDate: new Date(),
          status: "ACTIVE",
        },
      });

      return student;
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new StudentServiceError("A student with this Student ID already exists.");
    }
    throw error;
  }
}

export async function updateStudent(id: string, input: UpdateStudentInput) {
  const student = await findStudentById(id);
  if (!student || student.deletedAt) {
    throw new StudentServiceError("Student not found.");
  }

  return db.student.update({
    where: { id },
    data: {
      firstName: input.firstName,
      middleName: input.middleName || null,
      lastName: input.lastName || null,
      dateOfBirth: toDateOrUndefined(input.dateOfBirth) ?? null,
      gender: input.gender || null,
      status: input.status,
      notes: input.notes || null,
    },
  });
}

export async function archiveStudent(id: string, deletedBy: string) {
  const student = await findStudentById(id);
  if (!student || student.deletedAt) {
    throw new StudentServiceError("Student not found or already archived.");
  }

  return db.student.update({
    where: { id },
    data: { deletedAt: new Date(), deletedBy },
  });
}

export async function restoreStudent(id: string) {
  return db.student.update({
    where: { id },
    data: { deletedAt: null, deletedBy: null },
  });
}

export function getCurrentEnrollment<T extends { endDate: Date | null }>(student: {
  enrollments: T[];
}) {
  return student.enrollments.find((enrollment) => enrollment.endDate === null) ?? null;
}

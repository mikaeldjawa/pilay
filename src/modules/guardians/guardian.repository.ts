import { db } from "@/lib/db";

export async function listGuardiansForStudent(studentId: string) {
  return db.studentGuardian.findMany({
    where: { studentId, guardian: { deletedAt: null } },
    include: { guardian: true },
    orderBy: { isPrimaryContact: "desc" },
  });
}

export async function listParentContactsForStudent(studentId: string) {
  return db.parentContact.findMany({
    where: { studentId, deletedAt: null },
    include: { guardian: true },
    orderBy: { contactDate: "desc" },
  });
}

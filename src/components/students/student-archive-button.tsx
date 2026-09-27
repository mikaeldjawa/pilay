"use client";

import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { archiveStudentAction } from "@/modules/students/student.actions";

export function StudentArchiveButton({ studentId, studentName }: { studentId: string; studentName: string }) {
  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline">
          <Archive />
          Archive
        </Button>
      }
      title={`Archive ${studentName}?`}
      description="The student record is hidden from lists but not deleted. You can restore it later from the database if needed."
      confirmLabel="Archive"
      successMessage="Student archived"
      onConfirm={() => archiveStudentAction(studentId)}
    />
  );
}

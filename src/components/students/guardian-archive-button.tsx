"use client";

import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { archiveGuardianAction } from "@/modules/guardians/guardian.actions";

export function GuardianArchiveButton({
  guardianId,
  studentId,
  guardianName,
}: {
  guardianId: string;
  studentId: string;
  guardianName: string;
}) {
  return (
    <ConfirmDialog
      trigger={
        <Button variant="ghost" size="icon" className="size-6">
          <Archive className="size-3.5" />
        </Button>
      }
      title={`Archive ${guardianName}?`}
      description="The guardian is hidden from this student's list but not deleted."
      confirmLabel="Archive"
      successMessage="Guardian archived"
      onConfirm={() => archiveGuardianAction(guardianId, studentId)}
    />
  );
}

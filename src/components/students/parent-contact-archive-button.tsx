"use client";

import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { archiveParentContactAction } from "@/modules/guardians/guardian.actions";

export function ParentContactArchiveButton({
  contactId,
  studentId,
  additionalRevalidatePath,
}: {
  contactId: string;
  studentId: string;
  additionalRevalidatePath?: string;
}) {
  return (
    <ConfirmDialog
      trigger={
        <Button variant="ghost" size="icon" className="size-6">
          <Archive className="size-3.5" />
        </Button>
      }
      title="Archive this contact log entry?"
      description="The entry is hidden from this student's list but not deleted."
      confirmLabel="Archive"
      successMessage="Contact log entry archived"
      onConfirm={() => archiveParentContactAction(contactId, studentId, additionalRevalidatePath)}
    />
  );
}

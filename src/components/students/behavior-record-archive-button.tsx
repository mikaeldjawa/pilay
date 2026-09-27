"use client";

import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { archiveBehaviorRecordAction } from "@/modules/behavior/behavior.actions";

export function BehaviorRecordArchiveButton({
  recordId,
  studentId,
}: {
  recordId: string;
  studentId: string;
}) {
  return (
    <ConfirmDialog
      trigger={
        <Button variant="ghost" size="icon" className="size-6">
          <Archive className="size-3.5" />
        </Button>
      }
      title="Archive this behavior record?"
      description="The record is hidden from this student's list but not deleted."
      confirmLabel="Archive"
      successMessage="Behavior record archived"
      onConfirm={() => archiveBehaviorRecordAction(recordId, studentId)}
    />
  );
}

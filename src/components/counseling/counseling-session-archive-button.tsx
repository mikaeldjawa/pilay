"use client";

import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { archiveCounselingSessionAction } from "@/modules/counseling/counseling.actions";

export function CounselingSessionArchiveButton({
  sessionId,
  studentId,
}: {
  sessionId: string;
  studentId: string;
}) {
  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline">
          <Archive />
          Archive
        </Button>
      }
      title="Archive this counseling session?"
      description="The session is hidden from lists but not deleted. It stays viewable at this link if you have it."
      confirmLabel="Archive"
      successMessage="Counseling session archived"
      onConfirm={() => archiveCounselingSessionAction(sessionId, studentId)}
    />
  );
}

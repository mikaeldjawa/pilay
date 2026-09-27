"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { removeMaterialAction } from "@/modules/teaching-plans/teaching-plan.actions";

export function MaterialRemoveButton({
  planId,
  weekId,
  documentId,
  fileName,
}: {
  planId: string;
  weekId: string;
  documentId: string;
  fileName: string;
}) {
  return (
    <ConfirmDialog
      trigger={
        <Button variant="ghost" size="icon-sm" aria-label="Remove material">
          <Trash2 />
        </Button>
      }
      title="Remove this material?"
      description={`"${fileName}" will be detached from this week. The file itself is archived, not permanently deleted.`}
      confirmLabel="Remove"
      successMessage="Material removed"
      onConfirm={() => removeMaterialAction(planId, weekId, documentId)}
    />
  );
}

"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { ActionState } from "@/modules/students/student.actions";

export function LookupRowDeleteButton({
  id,
  name,
  entityLabel,
  deleteAction,
}: {
  id: string;
  name: string;
  entityLabel: string;
  deleteAction: (id: string) => Promise<ActionState>;
}) {
  return (
    <ConfirmDialog
      trigger={
        <Button variant="ghost" size="icon-sm" aria-label={`Delete ${name}`}>
          <Trash2 />
        </Button>
      }
      title={`Delete ${entityLabel.toLowerCase()} "${name}"?`}
      description="This permanently removes it. If it's still used by existing records the delete is blocked — deactivate it instead."
      confirmLabel="Delete"
      successMessage={`${entityLabel} deleted`}
      onConfirm={async () => {
        // The action returns { error } for a guarded/blocked delete instead of
        // throwing — surface that as the dialog's error toast.
        const result = await deleteAction(id);
        if (result?.error) throw new Error(result.error);
      }}
    />
  );
}

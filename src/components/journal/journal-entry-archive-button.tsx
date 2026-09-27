"use client";

import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { archiveJournalEntryAction } from "@/modules/journal/journal.actions";

export function JournalEntryArchiveButton({ id }: { id: string }) {
  return (
    <ConfirmDialog
      trigger={
        <Button variant="ghost" size="icon" className="size-6">
          <Archive className="size-3.5" />
        </Button>
      }
      title="Archive this journal entry?"
      description="The entry is hidden from your journal but not deleted."
      confirmLabel="Archive"
      successMessage="Journal entry archived"
      onConfirm={() => archiveJournalEntryAction(id)}
    />
  );
}

"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { JournalLinkPicker } from "@/components/journal/journal-link-picker";
import { updateJournalEntryAction } from "@/modules/journal/journal.actions";
import type { ActionState } from "@/modules/students/student.actions";
import { Pencil } from "lucide-react";
import { useActionState, useState } from "react";

export function JournalEntryEditDialog({
  entry,
  sessionOptions,
  incidentOptions,
  behaviorRecordOptions,
}: {
  entry: {
    id: string;
    entryDate: string;
    entryTime: string | null;
    title: string;
    note: string;
    sessionIds: string[];
    incidentIds: string[];
    behaviorRecordIds: string[];
  };
  sessionOptions: { id: string; label: string; date: string }[];
  incidentOptions: { id: string; label: string; date: string }[];
  behaviorRecordOptions: { id: string; label: string; date: string }[];
}) {
  const updateAction = updateJournalEntryAction.bind(null, entry.id);
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateAction,
    undefined,
  );
  const [entryDate, setEntryDate] = useState(entry.entryDate);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon" className="size-6">
            <Pencil className="size-3.5" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit journal entry</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor={`entryDate-${entry.id}`}>Date</FieldLabel>
                <Input
                  id={`entryDate-${entry.id}`}
                  name="entryDate"
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`entryTime-${entry.id}`}>Time</FieldLabel>
                <Input
                  id={`entryTime-${entry.id}`}
                  name="entryTime"
                  type="time"
                  defaultValue={entry.entryTime ?? ""}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor={`title-${entry.id}`}>Title</FieldLabel>
              <Input
                id={`title-${entry.id}`}
                name="title"
                defaultValue={entry.title}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`note-${entry.id}`}>Note</FieldLabel>
              <Textarea
                id={`note-${entry.id}`}
                name="note"
                rows={4}
                defaultValue={entry.note}
                required
              />
            </Field>
            <JournalLinkPicker
              name="sessionIds"
              label="Related counseling sessions (optional)"
              options={sessionOptions}
              initialSelected={entry.sessionIds}
              entryDate={entryDate}
            />
            <JournalLinkPicker
              name="incidentIds"
              label="Related incidents (optional)"
              options={incidentOptions}
              initialSelected={entry.incidentIds}
              entryDate={entryDate}
            />
            <JournalLinkPicker
              name="behaviorRecordIds"
              label="Related minor behavior logs (optional)"
              options={behaviorRecordOptions}
              initialSelected={entry.behaviorRecordIds}
              entryDate={entryDate}
            />
            {state?.error ? <FieldError>{state.error}</FieldError> : null}
            <Button type="submit" disabled={isPending} className="w-fit">
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}

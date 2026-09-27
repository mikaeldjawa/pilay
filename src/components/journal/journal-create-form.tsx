"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { JournalLinkPicker } from "@/components/journal/journal-link-picker";
import { createJournalEntryAction } from "@/modules/journal/journal.actions";
import type { ActionState } from "@/modules/students/student.actions";
import { useActionState, useState } from "react";

export function JournalCreateForm({
  sessionOptions,
  incidentOptions,
  behaviorRecordOptions,
}: {
  sessionOptions: { id: string; label: string; date: string }[];
  incidentOptions: { id: string; label: string; date: string }[];
  behaviorRecordOptions: { id: string; label: string; date: string }[];
}) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createJournalEntryAction,
    undefined,
  );
  const today = new Date().toISOString().slice(0, 10);
  const [entryDate, setEntryDate] = useState(today);

  return (
    <form action={formAction}>
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="entryDate">Date</FieldLabel>
            <Input
              id="entryDate"
              name="entryDate"
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="entryTime">Time</FieldLabel>
            <Input id="entryTime" name="entryTime" type="time" />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input id="title" name="title" placeholder="e.g. Met with Year 5 teachers" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="note">Note</FieldLabel>
          <Textarea id="note" name="note" rows={3} required />
        </Field>
        <JournalLinkPicker
          name="sessionIds"
          label="Related counseling sessions (optional)"
          options={sessionOptions}
          entryDate={entryDate}
        />
        <JournalLinkPicker
          name="incidentIds"
          label="Related incidents (optional)"
          options={incidentOptions}
          entryDate={entryDate}
        />
        <JournalLinkPicker
          name="behaviorRecordIds"
          label="Related minor behavior logs (optional)"
          options={behaviorRecordOptions}
          entryDate={entryDate}
        />
        {state?.error ? <FieldError>{state.error}</FieldError> : null}
        <Button type="submit" disabled={isPending} className="w-fit">
          {isPending ? "Saving..." : "Add entry"}
        </Button>
      </FieldGroup>
    </form>
  );
}

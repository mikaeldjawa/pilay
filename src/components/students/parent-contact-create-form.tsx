"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createParentContactAction } from "@/modules/guardians/guardian.actions";
import { CONTACT_METHODS } from "@/modules/guardians/guardian.schema";
import type { ActionState } from "@/modules/students/student.actions";
import { useActionState, useState } from "react";

export function ParentContactCreateForm({
  studentId,
  guardians,
  relatedIncidentId,
  relatedSessionId,
}: {
  studentId: string;
  guardians: { id: string; label: string }[];
  relatedIncidentId?: string;
  relatedSessionId?: string;
}) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createParentContactAction,
    undefined,
  );
  const [followUpRequired, setFollowUpRequired] = useState(false);

  if (guardians.length === 0) {
    return (
      <p className='text-sm text-muted-foreground'>
        Add a guardian first to log a contact.
      </p>
    );
  }

  return (
    <form action={formAction}>
      <input type='hidden' name='studentId' value={studentId} />
      {relatedIncidentId ? (
        <input type='hidden' name='relatedIncidentId' value={relatedIncidentId} />
      ) : null}
      {relatedSessionId ? (
        <input type='hidden' name='relatedSessionId' value={relatedSessionId} />
      ) : null}
      <FieldGroup>
        <div className='grid grid-cols-3 gap-3'>
          <Field>
            <FieldLabel htmlFor='guardianId'>Guardian</FieldLabel>
            <Select
              name='guardianId'
              required
              items={guardians.map((g) => ({ value: g.id, label: g.label }))}
            >
              <SelectTrigger id='guardianId'>
                <SelectValue placeholder='Select' />
              </SelectTrigger>
              <SelectContent>
                {guardians.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor='method'>Method</FieldLabel>
            <Select
              name='method'
              required
              items={CONTACT_METHODS.map((m) => ({ value: m, label: m }))}
            >
              <SelectTrigger id='method'>
                <SelectValue placeholder='Select' />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor='contactDate'>Date</FieldLabel>
            <Input id='contactDate' name='contactDate' type='date' required />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor='reason'>Reason</FieldLabel>
          <Input id='reason' name='reason' required />
        </Field>
        <Field>
          <FieldLabel htmlFor='summary'>Summary</FieldLabel>
          <Textarea id='summary' name='summary' rows={2} required />
        </Field>
        <Field>
          <FieldLabel htmlFor='outcome'>Outcome</FieldLabel>
          <Textarea id='outcome' name='outcome' rows={2} />
        </Field>
        <label className='flex items-center gap-2 text-sm'>
          <Checkbox
            name='followUpRequired'
            checked={followUpRequired}
            onCheckedChange={(checked) => setFollowUpRequired(checked === true)}
          />
          <Label className='font-normal'>Follow-up required</Label>
        </label>
        {followUpRequired ? (
          <div className='grid grid-cols-2 gap-3 rounded-lg border p-3'>
            <Field>
              <FieldLabel htmlFor='followUpTitle'>Follow-up title</FieldLabel>
              <Input id='followUpTitle' name='followUpTitle' required={followUpRequired} />
            </Field>
            <Field>
              <FieldLabel htmlFor='followUpDueDate'>Due date</FieldLabel>
              <Input id='followUpDueDate' name='followUpDueDate' type='date' required={followUpRequired} />
            </Field>
          </div>
        ) : null}
        {state?.error ? <FieldError>{state.error}</FieldError> : null}
        <Button type='submit' disabled={isPending} className='w-fit'>
          {isPending ? "Logging..." : "Log contact"}
        </Button>
      </FieldGroup>
    </form>
  );
}

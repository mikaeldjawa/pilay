"use client";

import { ChronicPatternBanner } from "@/components/behavior/chronic-pattern-banner";
import { MultiCodeChecklist } from "@/components/behavior/multi-code-checklist";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { createBehaviorRecordAction } from "@/modules/behavior/behavior.actions";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

type Option = { id: string; label: string };

export function MinorBehaviorQuickForm({
  students,
  behaviorCategories,
  actionCodes,
}: {
  students: Option[];
  behaviorCategories: { id: string; code: string | null; name: string }[];
  actionCodes: { id: string; code: string | null; name: string }[];
}) {
  const [state, formAction, isPending] = useActionState(
    createBehaviorRecordAction,
    undefined,
  );
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (state && !state.error) toast.success("Behavior record logged");
  }, [state]);

  return (
    <form action={formAction} className='flex flex-col gap-4'>
      {state?.pattern ? <ChronicPatternBanner pattern={state.pattern} /> : null}
      <FieldGroup>
        <Field orientation='responsive'>
          <FieldLabel htmlFor='studentId'>Student</FieldLabel>
          <Combobox
            id='studentId'
            name='studentId'
            required
            options={students}
            placeholder='Select student'
            searchPlaceholder='Search students...'
          />
        </Field>
        <Field>
          <FieldLabel>Behavior code(s)</FieldLabel>
          <MultiCodeChecklist
            idsFieldName='behaviorCategoryIds'
            otherFieldName='behaviorCategoryOther'
            options={behaviorCategories}
            otherPlaceholder='Other behavior, please specify'
          />
        </Field>
        <div className='grid grid-cols-2 gap-4'>
          <Field>
            <FieldLabel htmlFor='recordDate'>Date</FieldLabel>
            <Input
              id='recordDate'
              name='recordDate'
              type='date'
              defaultValue={today}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor='recordTime'>Time</FieldLabel>
            <Input id='recordTime' name='recordTime' type='time' />
          </Field>
        </div>
        <Field orientation='responsive'>
          <FieldLabel htmlFor='classroomReference'>Room / Area</FieldLabel>
          <Input
            id='classroomReference'
            name='classroomReference'
            placeholder='e.g. Room 12, Cafeteria, Playground'
          />
        </Field>
        <Field>
          <FieldLabel>Action taken</FieldLabel>
          <MultiCodeChecklist
            idsFieldName='actionCodeIds'
            otherFieldName='actionCodeOther'
            options={actionCodes}
            otherPlaceholder='Other action, please specify'
          />
        </Field>
        <Field>
          <FieldLabel htmlFor='description'>Note</FieldLabel>
          <Textarea id='description' name='description' rows={2} />
        </Field>
        {state?.error ? <FieldError>{state.error}</FieldError> : null}
        <Button type='submit' disabled={isPending}>
          {isPending ? "Logging..." : "Log behavior"}
        </Button>
      </FieldGroup>
    </form>
  );
}

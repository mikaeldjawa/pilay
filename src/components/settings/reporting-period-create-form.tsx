"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createReportingPeriodAction } from "@/modules/settings/settings.actions";
import { REPORTING_PERIOD_TYPES } from "@/modules/settings/settings.schema";
import type { ActionState } from "@/modules/students/student.actions";

export function ReportingPeriodCreateForm({
  periodTypeItems,
  academicYearItems,
}: {
  periodTypeItems: { value: string; label: string }[];
  academicYearItems: { value: string; label: string }[];
}) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createReportingPeriodAction,
    undefined,
  );

  useEffect(() => {
    if (state && !state.error) toast.success("Reporting period added");
  }, [state]);

  return (
    <form action={formAction} className='flex flex-wrap items-end gap-2'>
      <FieldGroup className='flex flex-1 flex-wrap items-end gap-2'>
        <div className='flex flex-wrap items-end gap-2'>
          <Field className='min-w-32 flex-1'>
            <Input name='name' placeholder='Name, e.g. September' required />
          </Field>
          <Field className='w-36'>
            <Select
              name='periodType'
              defaultValue={REPORTING_PERIOD_TYPES[0]}
              required
              items={periodTypeItems}
            >
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodTypeItems.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field className='w-40'>
            <Select name='academicYearId' required items={academicYearItems}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Academic year' />
              </SelectTrigger>
              <SelectContent>
                {academicYearItems.map((y) => (
                  <SelectItem key={y.value} value={y.value}>
                    {y.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <Input name='startDate' type='date' required />
          </Field>
          <Field>
            <Input name='endDate' type='date' required />
          </Field>
          <Button
            type='submit'
            variant='outline'
            size='sm'
            disabled={isPending}
          >
            {isPending ? "Adding..." : "Add"}
          </Button>
        </div>
        {state?.error ? <FieldError>{state.error}</FieldError> : null}
      </FieldGroup>
    </form>
  );
}

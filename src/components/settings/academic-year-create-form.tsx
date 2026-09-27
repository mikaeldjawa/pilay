"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { createAcademicYearAction } from "@/modules/settings/settings.actions";
import type { ActionState } from "@/modules/students/student.actions";

export function AcademicYearCreateForm() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createAcademicYearAction,
    undefined,
  );

  useEffect(() => {
    if (state && !state.error) toast.success("Academic year added");
  }, [state]);

  return (
    <form action={formAction} className='flex flex-wrap items-end gap-2'>
      <FieldGroup className='flex flex-1 flex-wrap items-end gap-2'>
        <div className='flex flex-wrap items-end gap-2'>
          <Field className='min-w-32 flex-1'>
            <Input name='name' placeholder='Name, e.g. 2026/2027' required />
          </Field>
          <Field>
            <Input name='startDate' type='date' required />
          </Field>
          <Field>
            <Input name='endDate' type='date' required />
          </Field>
          <label className='flex items-center gap-2 text-sm'>
            <Checkbox name='isCurrent' />
            <Label className='font-normal'>Set as current</Label>
          </label>
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

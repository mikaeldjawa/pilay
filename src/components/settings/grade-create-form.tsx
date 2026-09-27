"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { createGradeAction } from "@/modules/settings/settings.actions";
import type { ActionState } from "@/modules/students/student.actions";

export function GradeCreateForm() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(createGradeAction, undefined);

  useEffect(() => {
    if (state && !state.error) toast.success("Grade added");
  }, [state]);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <FieldGroup className="flex flex-1 flex-wrap items-end gap-2">
        <div className="flex flex-wrap items-end gap-2">
          <Field className="min-w-32 flex-1">
            <Input name="name" placeholder="Name, e.g. Grade 7" required />
          </Field>
          <Field className="w-24">
            <Input name="level" type="number" placeholder="Level" required />
          </Field>
          <Button type="submit" variant="outline" size="sm" disabled={isPending}>
            {isPending ? "Adding..." : "Add"}
          </Button>
        </div>
        {state?.error ? <FieldError>{state.error}</FieldError> : null}
      </FieldGroup>
    </form>
  );
}

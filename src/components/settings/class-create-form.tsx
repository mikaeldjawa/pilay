"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClassAction } from "@/modules/settings/settings.actions";
import type { ActionState } from "@/modules/students/student.actions";

export function ClassCreateForm({
  gradeItems,
  academicYearItems,
}: {
  gradeItems: { value: string; label: string }[];
  academicYearItems: { value: string; label: string }[];
}) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(createClassAction, undefined);

  useEffect(() => {
    if (state && !state.error) toast.success("Class added");
  }, [state]);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <FieldGroup className="flex flex-1 flex-wrap items-end gap-2">
        <div className="flex flex-wrap items-end gap-2">
          <Field className="w-28">
            <Input name="name" placeholder="Name, e.g. 7A" required />
          </Field>
          <Field className="w-40">
            <Select name="gradeId" required items={gradeItems}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                {gradeItems.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field className="w-40">
            <Select name="academicYearId" required items={academicYearItems}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Academic year" />
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
          <Field className="min-w-40 flex-1">
            <Input name="homeroomTeacher" placeholder="Homeroom teacher (optional)" />
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

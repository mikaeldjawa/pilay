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
import type { ActionState } from "@/modules/students/student.actions";

export function LookupCreateForm({
  hasCode = true,
  codeRequired = false,
  hasDescription = false,
  typeOptions,
  createAction,
  entityLabel = "Entry",
}: {
  hasCode?: boolean;
  codeRequired?: boolean;
  hasDescription?: boolean;
  typeOptions?: { value: string; label: string }[];
  createAction: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  entityLabel?: string;
}) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(createAction, undefined);

  useEffect(() => {
    if (state && !state.error) toast.success(`${entityLabel} added`);
  }, [state, entityLabel]);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <FieldGroup className="flex flex-1 flex-wrap items-end gap-2">
        <div className="flex flex-wrap items-end gap-2">
          {hasCode ? (
            <Field className="w-24">
              <Input name="code" placeholder="Code" required={codeRequired} />
            </Field>
          ) : null}
          <Field className="min-w-40 flex-1">
            <Input name="name" placeholder="Name" required />
          </Field>
          {typeOptions ? (
            <Field className="w-40">
              <Select name="type" defaultValue={typeOptions[0]?.value} required items={typeOptions}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : null}
          {hasDescription ? (
            <Field className="min-w-40 flex-1">
              <Input name="description" placeholder="Description (optional)" />
            </Field>
          ) : null}
          <Button type="submit" variant="outline" size="sm" disabled={isPending}>
            {isPending ? "Adding..." : "Add"}
          </Button>
        </div>
        {state?.error ? <FieldError>{state.error}</FieldError> : null}
      </FieldGroup>
    </form>
  );
}

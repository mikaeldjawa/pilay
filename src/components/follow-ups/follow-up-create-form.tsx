"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { createFollowUpAction } from "@/modules/follow-ups/follow-up.actions";
import type { ActionState } from "@/modules/students/student.actions";
import { FOLLOW_UP_PRIORITIES } from "@/modules/follow-ups/follow-up.schema";

export function FollowUpCreateForm({
  students,
  defaultStudentId,
}: {
  students: { id: string; label: string }[];
  defaultStudentId?: string;
}) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createFollowUpAction,
    undefined,
  );

  // Select.Root needs an `items` list to resolve the selected value's label
  // synchronously (on first paint, before the popup has ever been opened) —
  // without it, the trigger falls back to showing the raw id.
  const priorityItems = FOLLOW_UP_PRIORITIES.map((p) => ({ value: p, label: p }));

  return (
    <form action={formAction}>
      <FieldGroup>
        <div className="grid grid-cols-4 gap-3">
          <Field>
            <FieldLabel htmlFor="studentId">Student</FieldLabel>
            <Combobox
              id="studentId"
              name="studentId"
              required
              defaultValue={defaultStudentId}
              options={students}
              placeholder="Select"
              searchPlaceholder="Search students..."
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="title">Title</FieldLabel>
            <Input id="title" name="title" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="priority">Priority</FieldLabel>
            <Select name="priority" defaultValue="NORMAL" required items={priorityItems}>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityItems.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="dueDate">Due date</FieldLabel>
            <Input id="dueDate" name="dueDate" type="date" required />
          </Field>
        </div>
        {state?.error ? <FieldError>{state.error}</FieldError> : null}
        <Button type="submit" disabled={isPending} className="w-fit">
          {isPending ? "Adding..." : "Add follow-up"}
        </Button>
      </FieldGroup>
    </form>
  );
}

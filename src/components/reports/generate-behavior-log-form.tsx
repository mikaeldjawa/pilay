"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateMinorBehaviorLogReportAction } from "@/modules/reports/report.actions";
import type { ActionState } from "@/modules/students/student.actions";

export function GenerateBehaviorLogForm({
  classes,
}: {
  classes: { id: string; name: string }[];
}) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    generateMinorBehaviorLogReportAction,
    undefined,
  );

  const classItems = [
    { value: "all", label: "All classes" },
    ...classes.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <form action={formAction}>
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="dateFrom">From</FieldLabel>
            <Input id="dateFrom" name="dateFrom" type="date" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="dateTo">To</FieldLabel>
            <Input id="dateTo" name="dateTo" type="date" required />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="classId">Class (optional)</FieldLabel>
          <Select name="classId" defaultValue="all" items={classItems}>
            <SelectTrigger id="classId" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {classItems.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="classroomReference">Room / Area (optional)</FieldLabel>
          <Input id="classroomReference" name="classroomReference" placeholder="Leave blank for all rooms/areas" />
        </Field>
        {state?.error ? <FieldError>{state.error}</FieldError> : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Generating..." : "Generate log"}
        </Button>
      </FieldGroup>
    </form>
  );
}

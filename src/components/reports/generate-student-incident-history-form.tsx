"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { generateStudentIncidentHistoryReportAction } from "@/modules/reports/report.actions";
import type { ActionState } from "@/modules/students/student.actions";

export function GenerateStudentIncidentHistoryForm({
  students,
  defaultStudentId,
}: {
  students: { id: string; label: string }[];
  defaultStudentId?: string;
}) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    generateStudentIncidentHistoryReportAction,
    undefined,
  );

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="studentId">Student</FieldLabel>
          <Combobox
            id="studentId"
            name="studentId"
            required
            options={students}
            defaultValue={defaultStudentId}
            placeholder="Select student"
            searchPlaceholder="Search students..."
          />
        </Field>
        {state?.error ? <FieldError>{state.error}</FieldError> : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Generating..." : "Generate report"}
        </Button>
      </FieldGroup>
    </form>
  );
}

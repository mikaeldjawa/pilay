"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { generateMajorIncidentReportAction } from "@/modules/reports/report.actions";
import type { ActionState } from "@/modules/students/student.actions";

export function GenerateIncidentReportForm({ incidents }: { incidents: { id: string; label: string }[] }) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    generateMajorIncidentReportAction,
    undefined,
  );

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="incidentId">Major incident</FieldLabel>
          <Select
            name="incidentId"
            required
            items={incidents.map((i) => ({ value: i.id, label: i.label }))}
          >
            <SelectTrigger id="incidentId" className="w-full">
              <SelectValue placeholder="Select an incident to report on" />
            </SelectTrigger>
            <SelectContent>
              {incidents.map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        {state?.error ? <FieldError>{state.error}</FieldError> : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Generating..." : "Generate report"}
        </Button>
      </FieldGroup>
    </form>
  );
}

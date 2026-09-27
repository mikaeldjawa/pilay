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
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { generateCounselingCaseReportAction } from "@/modules/reports/report.actions";
import type { ActionState } from "@/modules/students/student.actions";

export function GenerateCounselingReportForm({
  sessions,
}: {
  sessions: { id: string; label: string }[];
}) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    generateCounselingCaseReportAction,
    undefined,
  );

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="counselingSessionId">Counseling session</FieldLabel>
          <Select
            name="counselingSessionId"
            required
            items={sessions.map((s) => ({ value: s.id, label: s.label }))}
          >
            <SelectTrigger id="counselingSessionId" className="w-full">
              <SelectValue placeholder="Select a session to report on" />
            </SelectTrigger>
            <SelectContent>
              {sessions.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="securityClassification">Security classification</FieldLabel>
          <Input id="securityClassification" name="securityClassification" defaultValue="Confidential" />
        </Field>
        <Field>
          <FieldLabel htmlFor="designatedTo">Designated to</FieldLabel>
          <Input id="designatedTo" name="designatedTo" defaultValue="School Leadership" />
        </Field>
        {state?.error ? <FieldError>{state.error}</FieldError> : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Generating..." : "Generate report"}
        </Button>
      </FieldGroup>
    </form>
  );
}

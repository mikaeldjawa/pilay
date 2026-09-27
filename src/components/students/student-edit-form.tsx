"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { updateStudentAction, type ActionState } from "@/modules/students/student.actions";
import { STUDENT_STATUSES } from "@/modules/students/student.schema";
import type { Student } from "@/generated/prisma/client";

export function StudentEditForm({ student }: { student: Student }) {
  const boundAction = updateStudentAction.bind(null, student.id);
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    boundAction,
    undefined,
  );

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field orientation="responsive">
          <FieldLabel htmlFor="firstName">First name</FieldLabel>
          <Input id="firstName" name="firstName" required defaultValue={student.firstName} />
        </Field>
        <Field orientation="responsive">
          <FieldLabel htmlFor="middleName">Middle name</FieldLabel>
          <Input id="middleName" name="middleName" placeholder="Optional" defaultValue={student.middleName ?? ""} />
        </Field>
        <Field orientation="responsive">
          <FieldLabel htmlFor="lastName">Last name</FieldLabel>
          <Input id="lastName" name="lastName" placeholder="Optional" defaultValue={student.lastName ?? ""} />
        </Field>
        <Field orientation="responsive">
          <FieldLabel htmlFor="dateOfBirth">Date of birth</FieldLabel>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            defaultValue={student.dateOfBirth?.toISOString().slice(0, 10)}
          />
        </Field>
        <Field orientation="responsive">
          <FieldLabel htmlFor="gender">Gender</FieldLabel>
          <Input id="gender" name="gender" defaultValue={student.gender ?? ""} />
        </Field>
        <Field orientation="responsive">
          <FieldLabel htmlFor="status">Status</FieldLabel>
          <Select
            name="status"
            defaultValue={student.status}
            required
            items={STUDENT_STATUSES.map((status) => ({ value: status, label: status }))}
          >
            <SelectTrigger id="status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STUDENT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea id="notes" name="notes" rows={3} defaultValue={student.notes ?? ""} />
        </Field>
        {state?.error ? <FieldError>{state.error}</FieldError> : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save changes"}
        </Button>
      </FieldGroup>
    </form>
  );
}

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
import { createStudentAction, type ActionState } from "@/modules/students/student.actions";

type Grade = { id: string; name: string };
type Class = { id: string; name: string; gradeId: string };

export function StudentForm({ grades, classes }: { grades: Grade[]; classes: Class[] }) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createStudentAction,
    undefined,
  );

  // Select.Root needs an `items` list to resolve the selected value's label
  // synchronously (on first paint, before the popup has ever been opened) —
  // without it, the trigger falls back to showing the raw id.
  const gradeItems = grades.map((g) => ({ value: g.id, label: g.name }));
  const classItems = classes.map((c) => ({ value: c.id, label: c.name }));

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field orientation="responsive">
          <FieldLabel htmlFor="studentId">Student ID</FieldLabel>
          <Input id="studentId" name="studentId" required placeholder="S-2026-0006" />
        </Field>
        <Field orientation="responsive">
          <FieldLabel htmlFor="firstName">First name</FieldLabel>
          <Input id="firstName" name="firstName" required />
        </Field>
        <Field orientation="responsive">
          <FieldLabel htmlFor="middleName">Middle name</FieldLabel>
          <Input id="middleName" name="middleName" placeholder="Optional" />
        </Field>
        <Field orientation="responsive">
          <FieldLabel htmlFor="lastName">Last name</FieldLabel>
          <Input id="lastName" name="lastName" placeholder="Optional" />
        </Field>
        <Field orientation="responsive">
          <FieldLabel htmlFor="dateOfBirth">Date of birth</FieldLabel>
          <Input id="dateOfBirth" name="dateOfBirth" type="date" />
        </Field>
        <Field orientation="responsive">
          <FieldLabel htmlFor="gender">Gender</FieldLabel>
          <Input id="gender" name="gender" />
        </Field>
        <Field orientation="responsive">
          <FieldLabel htmlFor="gradeId">Grade</FieldLabel>
          <Select name="gradeId" required items={gradeItems}>
            <SelectTrigger id="gradeId" className="w-full">
              <SelectValue placeholder="Select a grade" />
            </SelectTrigger>
            <SelectContent>
              {gradeItems.map((grade) => (
                <SelectItem key={grade.value} value={grade.value}>
                  {grade.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field orientation="responsive">
          <FieldLabel htmlFor="classId">Class</FieldLabel>
          <Select name="classId" required items={classItems}>
            <SelectTrigger id="classId" className="w-full">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classItems.map((klass) => (
                <SelectItem key={klass.value} value={klass.value}>
                  {klass.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea id="notes" name="notes" rows={3} />
        </Field>
        {state?.error ? <FieldError>{state.error}</FieldError> : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create student"}
        </Button>
      </FieldGroup>
    </form>
  );
}

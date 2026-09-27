"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createTeachingPlanAction,
  updateTeachingPlanAction,
} from "@/modules/teaching-plans/teaching-plan.actions";
import { SEMESTERS } from "@/modules/teaching-plans/teaching-plan.schema";
import type { ActionState } from "@/modules/students/student.actions";
import { useActionState } from "react";

type Option = { id: string; label: string };

type ExistingPlan = {
  id: string;
  title: string | null;
  description: string | null;
};

export function TeachingPlanForm({
  academicYears,
  classes,
  subjects,
  teachers,
  defaultTeacherId,
  defaultAcademicYearId,
  plan,
}: {
  academicYears: Option[];
  classes: Option[];
  subjects: Option[];
  teachers: Option[];
  defaultTeacherId?: string;
  defaultAcademicYearId?: string;
  plan?: ExistingPlan;
}) {
  const isEditing = !!plan;
  const boundAction = isEditing
    ? updateTeachingPlanAction.bind(null, plan.id)
    : createTeachingPlanAction;
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    boundAction,
    undefined,
  );

  // Select needs the `items` list to resolve the selected label synchronously
  // on first paint (before its popup has opened).
  const academicYearItems = academicYears.map((y) => ({ value: y.id, label: y.label }));
  const classItems = classes.map((c) => ({ value: c.id, label: c.label }));
  const subjectItems = subjects.map((s) => ({ value: s.id, label: s.label }));
  const teacherItems = teachers.map((t) => ({ value: t.id, label: t.label }));
  const semesterItems = SEMESTERS.map((s) => ({ value: s, label: `Semester ${s}` }));

  // Editing only touches descriptive metadata — the five identity fields are
  // fixed once the plan (and its weeks) exist.
  if (isEditing) {
    return (
      <form action={formAction}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="title">Title (optional)</FieldLabel>
            <Input id="title" name="title" defaultValue={plan.title ?? undefined} />
          </Field>
          <Field>
            <FieldLabel htmlFor="description">Description (optional)</FieldLabel>
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={plan.description ?? undefined}
            />
          </Field>
          {state?.error ? <FieldError>{state.error}</FieldError> : null}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </FieldGroup>
      </form>
    );
  }

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field orientation="responsive">
          <FieldLabel htmlFor="academicYearId">Academic year</FieldLabel>
          <Select
            name="academicYearId"
            required
            defaultValue={defaultAcademicYearId}
            items={academicYearItems}
          >
            <SelectTrigger id="academicYearId" className="w-full">
              <SelectValue placeholder="Select an academic year" />
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
        <Field orientation="responsive">
          <FieldLabel htmlFor="semester">Semester</FieldLabel>
          <Select name="semester" required defaultValue="1" items={semesterItems}>
            <SelectTrigger id="semester" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {semesterItems.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
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
              {classItems.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field orientation="responsive">
          <FieldLabel htmlFor="subjectId">Subject</FieldLabel>
          <Select name="subjectId" required items={subjectItems}>
            <SelectTrigger id="subjectId" className="w-full">
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {subjectItems.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field orientation="responsive">
          <FieldLabel htmlFor="teacherId">Teacher</FieldLabel>
          <Select
            name="teacherId"
            required
            defaultValue={defaultTeacherId}
            items={teacherItems}
          >
            <SelectTrigger id="teacherId" className="w-full">
              <SelectValue placeholder="Select a teacher" />
            </SelectTrigger>
            <SelectContent>
              {teacherItems.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="weekCount">Number of weeks</FieldLabel>
            <Input
              id="weekCount"
              name="weekCount"
              type="number"
              min={1}
              max={52}
              defaultValue={18}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="title">Title (optional)</FieldLabel>
            <Input id="title" name="title" placeholder="e.g. Algebra foundations" />
          </Field>
        </div>

        {state?.error ? <FieldError>{state.error}</FieldError> : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create plan"}
        </Button>
      </FieldGroup>
    </form>
  );
}

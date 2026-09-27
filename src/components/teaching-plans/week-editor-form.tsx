"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LessonEditor } from "@/components/teaching-plans/lesson-editor";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateWeekAction } from "@/modules/teaching-plans/teaching-plan.actions";
import type { ActionState } from "@/modules/students/student.actions";

type Lesson = { title: string; description: string; content: string };

export function WeekEditorForm({
  planId,
  weekId,
  topic,
  learningObjective,
  detailPlan,
  lessons,
}: {
  planId: string;
  weekId: string;
  topic: string | null;
  learningObjective: string | null;
  detailPlan: string | null;
  lessons: Lesson[];
}) {
  const boundAction = updateWeekAction.bind(null, planId, weekId);
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    boundAction,
    undefined,
  );

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="topic">Topic</FieldLabel>
          <Input
            id="topic"
            name="topic"
            placeholder="e.g. Linear Equations"
            defaultValue={topic ?? undefined}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="learningObjective">Learning objective</FieldLabel>
          <Textarea
            id="learningObjective"
            name="learningObjective"
            rows={2}
            placeholder="What students should be able to do by the end of the week"
            defaultValue={learningObjective ?? undefined}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="detailPlan">Detail plan</FieldLabel>
          <Textarea
            id="detailPlan"
            name="detailPlan"
            rows={6}
            placeholder={"- Introduction\n- Explanation\n- Guided practice\n- Review"}
            defaultValue={detailPlan ?? undefined}
          />
        </Field>

        <FieldSeparator />
        <LessonEditor name="lessons" initialRows={lessons} />

        {state?.error ? <FieldError>{state.error}</FieldError> : null}
        <div className="flex gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            render={<Link href={`/teaching-plans/${planId}/weeks/${weekId}`} />}
            nativeButton={false}
          >
            Cancel
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}

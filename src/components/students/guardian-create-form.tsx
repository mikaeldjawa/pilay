"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { createGuardianAction } from "@/modules/guardians/guardian.actions";
import type { ActionState } from "@/modules/students/student.actions";

export function GuardianCreateForm({ studentId }: { studentId: string }) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createGuardianAction,
    undefined,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="studentId" value={studentId} />
      <FieldGroup>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="fullName">Full name</FieldLabel>
            <Input id="fullName" name="fullName" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="relationship">Relationship</FieldLabel>
            <Input id="relationship" name="relationship" placeholder="Mother, Father, Guardian..." />
          </Field>
          <Field>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input id="phone" name="phone" />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" name="email" type="email" />
          </Field>
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox name="isPrimaryContact" />
            <Label className="font-normal">Primary contact</Label>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox name="isEmergencyContact" />
            <Label className="font-normal">Emergency contact</Label>
          </label>
        </div>
        {state?.error ? <FieldError>{state.error}</FieldError> : null}
        <Button type="submit" disabled={isPending} className="w-fit">
          {isPending ? "Adding..." : "Add guardian"}
        </Button>
      </FieldGroup>
    </form>
  );
}

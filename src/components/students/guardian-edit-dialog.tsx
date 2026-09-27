"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateGuardianAction } from "@/modules/guardians/guardian.actions";
import type { ActionState } from "@/modules/students/student.actions";
import { Pencil } from "lucide-react";
import { useActionState } from "react";

export function GuardianEditDialog({
  studentId,
  guardian,
}: {
  studentId: string;
  guardian: {
    id: string;
    fullName: string;
    relationship: string | null;
    phone: string | null;
    email: string | null;
    isPrimaryContact: boolean;
    isEmergencyContact: boolean;
  };
}) {
  const updateAction = updateGuardianAction.bind(null, guardian.id);
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateAction,
    undefined,
  );

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant='ghost' size='icon' className='size-6'>
            <Pencil className='size-3.5' />
          </Button>
        }
        // nativeButton={true}
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit guardian</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <input type='hidden' name='studentId' value={studentId} />
          <FieldGroup>
            <div className='grid grid-cols-2 gap-3'>
              <Field>
                <FieldLabel htmlFor={`fullName-${guardian.id}`}>
                  Full name
                </FieldLabel>
                <Input
                  id={`fullName-${guardian.id}`}
                  name='fullName'
                  defaultValue={guardian.fullName}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`relationship-${guardian.id}`}>
                  Relationship
                </FieldLabel>
                <Input
                  id={`relationship-${guardian.id}`}
                  name='relationship'
                  defaultValue={guardian.relationship ?? ""}
                  placeholder='Mother, Father, Guardian...'
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`phone-${guardian.id}`}>Phone</FieldLabel>
                <Input
                  id={`phone-${guardian.id}`}
                  name='phone'
                  defaultValue={guardian.phone ?? ""}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`email-${guardian.id}`}>Email</FieldLabel>
                <Input
                  id={`email-${guardian.id}`}
                  name='email'
                  type='email'
                  defaultValue={guardian.email ?? ""}
                />
              </Field>
            </div>
            <div className='flex gap-6'>
              <label className='flex items-center gap-2 text-sm'>
                <Checkbox
                  name='isPrimaryContact'
                  defaultChecked={guardian.isPrimaryContact}
                />
                <Label className='font-normal'>Primary contact</Label>
              </label>
              <label className='flex items-center gap-2 text-sm'>
                <Checkbox
                  name='isEmergencyContact'
                  defaultChecked={guardian.isEmergencyContact}
                />
                <Label className='font-normal'>Emergency contact</Label>
              </label>
            </div>
            {state?.error ? <FieldError>{state.error}</FieldError> : null}
            <Button type='submit' disabled={isPending} className='w-fit'>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}

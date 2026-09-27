"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateAcademicYearAction } from "@/modules/settings/settings.actions";
import type { ActionState } from "@/modules/students/student.actions";

type AcademicYearRow = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
};

export function AcademicYearEditDialog({ year }: { year: AcademicYearRow }) {
  const [open, setOpen] = useState(false);

  async function submitAndNotify(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const result = await updateAcademicYearAction(year.id, prevState, formData);
    if (!result?.error) {
      toast.success("Academic year updated");
      setOpen(false);
    }
    return result;
  }

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    submitAndNotify,
    undefined,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant='ghost' size='icon' className='size-6'>
            <Pencil className='size-3.5' />
          </Button>
        }
        // nativeButton={false}
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {year.name}</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field>
              <Input
                name='name'
                placeholder='Name'
                defaultValue={year.name}
                required
              />
            </Field>
            <div className='grid grid-cols-2 gap-2'>
              <Field>
                <Input
                  name='startDate'
                  type='date'
                  defaultValue={year.startDate.toISOString().slice(0, 10)}
                  required
                />
              </Field>
              <Field>
                <Input
                  name='endDate'
                  type='date'
                  defaultValue={year.endDate.toISOString().slice(0, 10)}
                  required
                />
              </Field>
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

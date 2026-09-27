"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateReportingPeriodAction } from "@/modules/settings/settings.actions";
import type { ActionState } from "@/modules/students/student.actions";

type ReportingPeriodRow = {
  id: string;
  name: string;
  periodType: string;
  startDate: Date;
  endDate: Date;
  academicYearId: string;
  academicYear: { name: string };
};

export function ReportingPeriodEditDialog({
  period,
  periodTypeItems,
  academicYearItems,
}: {
  period: ReportingPeriodRow;
  periodTypeItems: { value: string; label: string }[];
  academicYearItems: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  async function submitAndNotify(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const result = await updateReportingPeriodAction(period.id, prevState, formData);
    if (!result?.error) {
      toast.success("Reporting period updated");
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
          <DialogTitle>Edit {period.name}</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <div className='flex flex-wrap gap-2'>
              <Field className='min-w-32 flex-1'>
                <Input
                  name='name'
                  placeholder='Name'
                  defaultValue={period.name}
                  required
                />
              </Field>
              <Field className='w-36'>
                <Select
                  name='periodType'
                  defaultValue={period.periodType}
                  required
                  items={periodTypeItems}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {periodTypeItems.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field className='w-40'>
                <Select
                  name='academicYearId'
                  defaultValue={period.academicYearId}
                  required
                  items={academicYearItems}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Academic year' />
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
              <Field>
                <Input
                  name='startDate'
                  type='date'
                  defaultValue={period.startDate.toISOString().slice(0, 10)}
                  required
                />
              </Field>
              <Field>
                <Input
                  name='endDate'
                  type='date'
                  defaultValue={period.endDate.toISOString().slice(0, 10)}
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

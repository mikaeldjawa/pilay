"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateClassAction } from "@/modules/settings/settings.actions";
import type { ActionState } from "@/modules/students/student.actions";

type ClassRow = {
  id: string;
  name: string;
  homeroomTeacher: string | null;
  gradeId: string;
  academicYearId: string;
  grade: { name: string };
  academicYear: { name: string };
};

export function ClassEditDialog({
  cls,
  gradeItems,
  academicYearItems,
}: {
  cls: ClassRow;
  gradeItems: { value: string; label: string }[];
  academicYearItems: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  async function submitAndNotify(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const result = await updateClassAction(cls.id, prevState, formData);
    if (!result?.error) {
      toast.success("Class updated");
      setOpen(false);
    }
    return result;
  }

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(submitAndNotify, undefined);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon" className="size-6">
            <Pencil className="size-3.5" />
          </Button>
        }
        // nativeButton={false}
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {cls.name}</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <div className="flex flex-wrap gap-2">
              <Field className="w-28">
                <Input name="name" placeholder="Name" defaultValue={cls.name} required />
              </Field>
              <Field className="w-40">
                <Select name="gradeId" defaultValue={cls.gradeId} required items={gradeItems}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeItems.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field className="w-40">
                <Select name="academicYearId" defaultValue={cls.academicYearId} required items={academicYearItems}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Academic year" />
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
              <Field className="min-w-40 flex-1">
                <Input
                  name="homeroomTeacher"
                  placeholder="Homeroom teacher (optional)"
                  defaultValue={cls.homeroomTeacher ?? ""}
                />
              </Field>
            </div>
            {state?.error ? <FieldError>{state.error}</FieldError> : null}
            <Button type="submit" disabled={isPending} className="w-fit">
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}

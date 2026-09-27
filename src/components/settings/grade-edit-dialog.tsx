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
import { updateGradeAction } from "@/modules/settings/settings.actions";
import type { ActionState } from "@/modules/students/student.actions";

type GradeRow = {
  id: string;
  name: string;
  level: number;
};

export function GradeEditDialog({ grade }: { grade: GradeRow }) {
  const [open, setOpen] = useState(false);

  async function submitAndNotify(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const result = await updateGradeAction(grade.id, prevState, formData);
    if (!result?.error) {
      toast.success("Grade updated");
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
          <DialogTitle>Edit {grade.name}</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <div className="flex flex-wrap gap-2">
              <Field className="min-w-32 flex-1">
                <Input name="name" placeholder="Name" defaultValue={grade.name} required />
              </Field>
              <Field className="w-24">
                <Input name="level" type="number" placeholder="Level" defaultValue={grade.level} required />
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

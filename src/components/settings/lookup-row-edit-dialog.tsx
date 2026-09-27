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
import type { ActionState } from "@/modules/students/student.actions";

type LookupRow = {
  id: string;
  code?: string | null;
  name: string;
  description?: string | null;
  isActive?: boolean;
  typeLabel?: string | null;
};

type UpdateAction = (id: string, prevState: ActionState, formData: FormData) => Promise<ActionState>;

export function LookupRowEditDialog({
  row,
  hasCode,
  codeRequired,
  hasDescription,
  typeOptions,
  updateAction,
  entityLabel = "Entry",
}: {
  row: LookupRow;
  hasCode: boolean;
  codeRequired: boolean;
  hasDescription: boolean;
  typeOptions?: { value: string; label: string }[];
  updateAction: UpdateAction;
  entityLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  async function submitAndNotify(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const result = await updateAction(row.id, prevState, formData);
    if (!result?.error) {
      toast.success(`${entityLabel} updated`);
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
          <DialogTitle>Edit {row.name}</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <div className="flex flex-wrap gap-2">
              {hasCode ? (
                <Field className="w-24">
                  <Input name="code" placeholder="Code" defaultValue={row.code ?? ""} required={codeRequired} />
                </Field>
              ) : null}
              <Field className="min-w-40 flex-1">
                <Input name="name" placeholder="Name" defaultValue={row.name} required />
              </Field>
              {typeOptions ? (
                <Field className="w-40">
                  <Select
                    name="type"
                    defaultValue={row.typeLabel ?? typeOptions[0]?.value}
                    required
                    items={typeOptions}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              ) : null}
              {hasDescription ? (
                <Field className="min-w-40 flex-1">
                  <Input name="description" placeholder="Description (optional)" defaultValue={row.description ?? ""} />
                </Field>
              ) : null}
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

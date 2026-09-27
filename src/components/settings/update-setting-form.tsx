"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { updateSettingAction } from "@/modules/settings/settings.actions";

export function UpdateSettingForm({
  settingKey,
  label,
  defaultValue,
}: {
  settingKey: string;
  label: string;
  defaultValue: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateSettingAction(formData);
        toast.success(`${label} updated`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex items-end gap-2">
      <input type="hidden" name="key" value={settingKey} />
      <Field className="flex-1">
        <FieldLabel htmlFor={settingKey}>{label}</FieldLabel>
        <Input id={settingKey} name="value" defaultValue={defaultValue} />
      </Field>
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        {isPending ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}

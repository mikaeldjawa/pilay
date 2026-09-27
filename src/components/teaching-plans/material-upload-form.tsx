"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { attachMaterialAction } from "@/modules/teaching-plans/teaching-plan.actions";
import type { ActionState } from "@/modules/students/student.actions";

export function MaterialUploadForm({
  planId,
  weekId,
}: {
  planId: string;
  weekId: string;
}) {
  const boundAction = attachMaterialAction.bind(null, planId, weekId);
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    boundAction,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // A successful upload resolves to an empty object (no `error`); reset the
    // form and confirm so the revalidated list is obviously the result.
    if (state && !state.error) {
      toast.success("Material attached");
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="material-title">Title (optional)</FieldLabel>
          <Input
            id="material-title"
            name="title"
            placeholder="Defaults to the file name"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="material-file">File</FieldLabel>
          <Input id="material-file" name="file" type="file" required />
        </Field>
      </div>
      {state?.error ? <FieldError>{state.error}</FieldError> : null}
      <div>
        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          {isPending ? "Uploading..." : "Attach material"}
        </Button>
      </div>
    </form>
  );
}

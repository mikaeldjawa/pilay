"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { uploadDocumentAction } from "@/modules/documents/document.actions";
import type { ActionState } from "@/modules/students/student.actions";

type Option = { id: string; label: string };

export function DocumentUploadForm({
  categories,
  students,
}: {
  categories: Option[];
  students: Option[];
}) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    uploadDocumentAction,
    undefined,
  );

  useEffect(() => {
    if (state && !state.error) toast.success("Document uploaded");
  }, [state]);

  return (
    <form action={formAction}>
      <FieldGroup>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="title">Title</FieldLabel>
            <Input id="title" name="title" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="documentCategoryId">Category</FieldLabel>
            <Select
              name="documentCategoryId"
              required
              items={categories.map((c) => ({ value: c.id, label: c.label }))}
            >
              <SelectTrigger id="documentCategoryId" className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="studentId">Student (optional)</FieldLabel>
            <Combobox
              id="studentId"
              name="studentId"
              options={students}
              placeholder="No student link"
              searchPlaceholder="Search students..."
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="file">File</FieldLabel>
            <Input id="file" name="file" type="file" required />
          </Field>
        </div>
        {state?.error ? <FieldError>{state.error}</FieldError> : null}
        <Button type="submit" disabled={isPending} className="w-fit">
          {isPending ? "Uploading..." : "Upload document"}
        </Button>
      </FieldGroup>
    </form>
  );
}

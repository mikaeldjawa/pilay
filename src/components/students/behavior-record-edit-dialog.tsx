"use client";

import { MultiCodeChecklist } from "@/components/behavior/multi-code-checklist";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { updateBehaviorRecordAction } from "@/modules/behavior/behavior.actions";
import type { ActionState } from "@/modules/students/student.actions";
import { Pencil } from "lucide-react";
import { useActionState } from "react";

type Option = { id: string; code: string | null; name: string };

export function BehaviorRecordEditDialog({
  studentId,
  behaviorCategories,
  actionCodes,
  record,
}: {
  studentId: string;
  behaviorCategories: Option[];
  actionCodes: Option[];
  record: {
    id: string;
    behaviorCategoryIds: string[];
    otherBehaviorText: string | null;
    recordDate: string;
    recordTime: string | null;
    classroomReference: string | null;
    actionCodeIds: string[];
    otherActionText: string | null;
    description: string | null;
  };
}) {
  const updateAction = updateBehaviorRecordAction.bind(null, record.id);
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
        // nativeButton={false}
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit behavior record</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <input type='hidden' name='studentId' value={studentId} />
          <FieldGroup>
            <Field>
              <FieldLabel>Behavior code(s)</FieldLabel>
              <MultiCodeChecklist
                idsFieldName='behaviorCategoryIds'
                otherFieldName='behaviorCategoryOther'
                options={behaviorCategories}
                initialSelected={record.behaviorCategoryIds}
                initialOther={record.otherBehaviorText ?? undefined}
                otherPlaceholder='Other behavior, please specify'
              />
            </Field>
            <div className='grid grid-cols-2 gap-4'>
              <Field>
                <FieldLabel htmlFor={`recordDate-${record.id}`}>
                  Date
                </FieldLabel>
                <Input
                  id={`recordDate-${record.id}`}
                  name='recordDate'
                  type='date'
                  defaultValue={record.recordDate}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`recordTime-${record.id}`}>
                  Time
                </FieldLabel>
                <Input
                  id={`recordTime-${record.id}`}
                  name='recordTime'
                  type='time'
                  defaultValue={record.recordTime ?? ""}
                />
              </Field>
            </div>
            <Field orientation='responsive'>
              <FieldLabel htmlFor={`classroomReference-${record.id}`}>
                Room / Area
              </FieldLabel>
              <Input
                id={`classroomReference-${record.id}`}
                name='classroomReference'
                defaultValue={record.classroomReference ?? ""}
                placeholder='e.g. Room 12, Cafeteria, Playground'
              />
            </Field>
            <Field>
              <FieldLabel>Action taken</FieldLabel>
              <MultiCodeChecklist
                idsFieldName='actionCodeIds'
                otherFieldName='actionCodeOther'
                options={actionCodes}
                initialSelected={record.actionCodeIds}
                initialOther={record.otherActionText ?? undefined}
                otherPlaceholder='Other action, please specify'
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`description-${record.id}`}>Note</FieldLabel>
              <Textarea
                id={`description-${record.id}`}
                name='description'
                rows={2}
                defaultValue={record.description ?? ""}
              />
            </Field>
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

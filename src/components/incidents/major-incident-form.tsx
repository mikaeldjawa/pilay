"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Field, FieldGroup, FieldLabel, FieldError, FieldSeparator } from "@/components/ui/field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { createMajorIncidentAction, updateMajorIncidentAction } from "@/modules/incidents/incident.actions";
import type { ActionState } from "@/modules/students/student.actions";
import { INCIDENT_STATUSES } from "@/modules/incidents/incident.schema";
import { ParticipantsEditor } from "@/components/incidents/participants-editor";
import { WitnessesEditor } from "@/components/incidents/witnesses-editor";
import { CategoriesChecklist } from "@/components/incidents/categories-checklist";
import { ObjectiveWritingGuidance } from "@/components/incidents/objective-writing-guidance";

type Option = { id: string; label: string };

type ExistingIncident = {
  id: string;
  incidentNumber: string;
  primaryStudentId: string;
  incidentCategoryId: string;
  incidentDate: Date;
  incidentTime: string | null;
  location: string | null;
  counselorOrAdminCalledAt: Date | null;
  status: string;
  parentContactRequired: boolean;
  leadershipNotified: boolean;
  supportPlan: string | null;
  narrative: {
    antecedent: string;
    behavior: string;
    impact: string;
    additionalInformation: string | null;
  } | null;
  response: {
    studentEscortedToOffice: boolean;
    classroomEvacuated: boolean;
    firstAidOrNurseRequested: boolean;
    onsiteDeescalationByCounselor: boolean;
    additionalAction: string | null;
  } | null;
  participants: { studentId: string; involvementType: string; notes: string | null }[];
  witnesses: { name: string; role: string | null; notes: string | null }[];
  categorySelections: { incidentCategoryId: string }[];
  signoffs: { role: string; signerName: string | null }[];
};

export function MajorIncidentForm({
  students,
  categories,
  defaultStudentId,
  defaultEscalateBehaviorRecordIds,
  incident,
}: {
  students: Option[];
  categories: { id: string; name: string }[];
  defaultStudentId?: string;
  defaultEscalateBehaviorRecordIds?: string[];
  incident?: ExistingIncident;
}) {
  const isEditing = !!incident;
  const boundAction = isEditing
    ? updateMajorIncidentAction.bind(null, incident.id)
    : createMajorIncidentAction;
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(boundAction, undefined);
  const [primaryCategoryId, setPrimaryCategoryId] = useState(
    incident?.incidentCategoryId ?? categories[0]?.id ?? "",
  );
  const [parentContactRequired, setParentContactRequired] = useState(
    incident?.parentContactRequired ?? false,
  );

  const signoffByRole = (role: string) => incident?.signoffs.find((s) => s.role === role)?.signerName ?? "";

  // Select.Root needs an `items` list to resolve the selected value's label
  // synchronously (on first paint, before the popup has ever been opened) —
  // without it, the trigger falls back to showing the raw id.
  const categoryItems = categories.map((c) => ({ value: c.id, label: c.name }));
  const statusItems = INCIDENT_STATUSES.map((s) => ({ value: s, label: s.replaceAll("_", " ") }));

  return (
    <form action={formAction}>
      <FieldGroup>
        {defaultEscalateBehaviorRecordIds?.length ? (
          <>
            <input
              type="hidden"
              name="escalateBehaviorRecordIds"
              value={defaultEscalateBehaviorRecordIds.join(",")}
            />
            <Alert variant="destructive">
              <AlertTriangle />
              <AlertTitle>Escalating a chronic minor pattern</AlertTitle>
              <AlertDescription>
                {defaultEscalateBehaviorRecordIds.length} behavior record
                {defaultEscalateBehaviorRecordIds.length === 1 ? "" : "s"} will be linked to this
                incident once it&apos;s filed.
              </AlertDescription>
            </Alert>
          </>
        ) : null}
        <FieldSeparator>Report Metadata</FieldSeparator>
        <Field orientation="responsive">
          <FieldLabel htmlFor="primaryStudentId">Primary student</FieldLabel>
          <Combobox
            id="primaryStudentId"
            name="primaryStudentId"
            required
            defaultValue={incident?.primaryStudentId ?? defaultStudentId}
            options={students}
            placeholder="Select student"
            searchPlaceholder="Search students..."
          />
        </Field>
        {isEditing ? (
          <Field>
            <FieldLabel htmlFor="status">Case status</FieldLabel>
            <Select name="status" required defaultValue={incident.status} items={statusItems}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusItems.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        ) : null}
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="incidentDate">Incident date</FieldLabel>
            <Input
              id="incidentDate"
              name="incidentDate"
              type="date"
              required
              defaultValue={incident?.incidentDate.toISOString().slice(0, 10)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="incidentTime">Incident time</FieldLabel>
            <Input
              id="incidentTime"
              name="incidentTime"
              type="time"
              defaultValue={incident?.incidentTime ?? undefined}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="location">Location</FieldLabel>
          <Input id="location" name="location" defaultValue={incident?.location ?? undefined} />
        </Field>
        <Field>
          <FieldLabel htmlFor="counselorOrAdminCalledAt">Counselor/Admin called at</FieldLabel>
          <Input
            id="counselorOrAdminCalledAt"
            name="counselorOrAdminCalledAt"
            type="datetime-local"
            defaultValue={
              incident?.counselorOrAdminCalledAt
                ? incident.counselorOrAdminCalledAt.toISOString().slice(0, 16)
                : undefined
            }
          />
        </Field>

        <FieldSeparator>Individuals Involved</FieldSeparator>
        <ParticipantsEditor
          name="participants"
          students={students}
          initialRows={incident?.participants.map((p) => ({
            studentId: p.studentId,
            involvementType: p.involvementType as never,
            notes: p.notes ?? "",
          }))}
        />
        <WitnessesEditor
          name="witnesses"
          initialRows={incident?.witnesses.map((w) => ({
            name: w.name,
            role: w.role ?? "",
            notes: w.notes ?? "",
          }))}
        />

        <FieldSeparator>Incident Category</FieldSeparator>
        <Field>
          <FieldLabel htmlFor="incidentCategoryId">Primary category</FieldLabel>
          <Select
            name="incidentCategoryId"
            required
            value={primaryCategoryId}
            onValueChange={(v) => v && setPrimaryCategoryId(v)}
            items={categoryItems}
          >
            <SelectTrigger id="incidentCategoryId" className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categoryItems.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <CategoriesChecklist
          name="additionalCategoryIds"
          categories={categories}
          excludeId={primaryCategoryId}
          initialSelected={incident?.categorySelections
            .map((c) => c.incidentCategoryId)
            .filter((id) => id !== primaryCategoryId)}
        />

        <FieldSeparator>Factual Description</FieldSeparator>
        <ObjectiveWritingGuidance />
        <Field>
          <FieldLabel htmlFor="antecedent">Antecedent — what happened before</FieldLabel>
          <Textarea
            id="antecedent"
            name="antecedent"
            rows={2}
            required
            defaultValue={incident?.narrative?.antecedent}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="behavior">Behavior — what happened</FieldLabel>
          <Textarea
            id="behavior"
            name="behavior"
            rows={2}
            required
            defaultValue={incident?.narrative?.behavior}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="impact">Impact — what happened after</FieldLabel>
          <Textarea
            id="impact"
            name="impact"
            rows={2}
            required
            defaultValue={incident?.narrative?.impact}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="additionalInformation">Additional information</FieldLabel>
          <Textarea
            id="additionalInformation"
            name="additionalInformation"
            rows={2}
            defaultValue={incident?.narrative?.additionalInformation ?? undefined}
          />
        </Field>

        <FieldSeparator>Immediate Action Taken</FieldSeparator>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["studentEscortedToOffice", "Student escorted to office", incident?.response?.studentEscortedToOffice],
              ["classroomEvacuated", "Classroom evacuated", incident?.response?.classroomEvacuated],
              [
                "firstAidOrNurseRequested",
                "First aid / nurse requested",
                incident?.response?.firstAidOrNurseRequested,
              ],
              [
                "onsiteDeescalationByCounselor",
                "On-site de-escalation by counselor",
                incident?.response?.onsiteDeescalationByCounselor,
              ],
            ] as const
          ).map(([field, label, checked]) => (
            <label key={field} className="flex items-center gap-2 text-sm">
              <Checkbox name={field} defaultChecked={checked ?? false} />
              <Label className="font-normal">{label}</Label>
            </label>
          ))}
        </div>
        <Field>
          <FieldLabel htmlFor="additionalAction">Additional action</FieldLabel>
          <Textarea
            id="additionalAction"
            name="additionalAction"
            rows={2}
            defaultValue={incident?.response?.additionalAction ?? undefined}
          />
        </Field>

        <FieldSeparator>Follow-Up &amp; Parent Log</FieldSeparator>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              name="parentContactRequired"
              checked={parentContactRequired}
              onCheckedChange={(c) => setParentContactRequired(c === true)}
            />
            <Label className="font-normal">Parent contact required</Label>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox name="leadershipNotified" defaultChecked={incident?.leadershipNotified ?? false} />
            <Label className="font-normal">Leadership notified</Label>
          </label>
        </div>
        {parentContactRequired ? (
          <div className="grid grid-cols-2 gap-4 rounded-lg border p-3">
            {isEditing ? (
              <p className="col-span-2 text-xs text-muted-foreground">
                If a follow-up doesn&apos;t already exist for this incident, fill these in to create one.
              </p>
            ) : null}
            <Field>
              <FieldLabel htmlFor="followUpTitle">Follow-up title</FieldLabel>
              <Input
                id="followUpTitle"
                name="followUpTitle"
                required={parentContactRequired && !isEditing}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="followUpDueDate">Due date</FieldLabel>
              <Input
                id="followUpDueDate"
                name="followUpDueDate"
                type="date"
                required={parentContactRequired && !isEditing}
              />
            </Field>
          </div>
        ) : null}
        <Field>
          <FieldLabel htmlFor="supportPlan">Support plan</FieldLabel>
          <Textarea
            id="supportPlan"
            name="supportPlan"
            rows={2}
            defaultValue={incident?.supportPlan ?? undefined}
          />
        </Field>

        <FieldSeparator>Sign-Off &amp; Case Status</FieldSeparator>
        <div className="grid grid-cols-3 gap-4">
          <Field>
            <FieldLabel htmlFor="reportingStaffSignerName">Reporting staff</FieldLabel>
            <Input
              id="reportingStaffSignerName"
              name="reportingStaffSignerName"
              placeholder="Name"
              defaultValue={signoffByRole("REPORTING_STAFF")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="counselorSignerName">Counselor</FieldLabel>
            <Input
              id="counselorSignerName"
              name="counselorSignerName"
              placeholder="Name"
              defaultValue={signoffByRole("COUNSELOR")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="leadershipSignerName">Leadership</FieldLabel>
            <Input
              id="leadershipSignerName"
              name="leadershipSignerName"
              placeholder="Name"
              defaultValue={signoffByRole("LEADERSHIP")}
            />
          </Field>
        </div>

        {state?.error ? <FieldError>{state.error}</FieldError> : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : isEditing ? "Save changes" : "File major incident report"}
        </Button>
      </FieldGroup>
    </form>
  );
}

"use client";

import { ActionItemsEditor } from "@/components/counseling/action-items-editor";
import { RepeatingTextFields } from "@/components/counseling/repeating-text-fields";
import { RiskAssessmentsEditor } from "@/components/counseling/risk-assessments-editor";
import { TimelineEventsEditor } from "@/components/counseling/timeline-events-editor";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createCounselingSessionAction,
  updateCounselingSessionAction,
} from "@/modules/counseling/counseling.actions";
import {
  CREDIBILITY_RATINGS,
  RISK_LEVELS,
  SESSION_STATUSES,
} from "@/modules/counseling/counseling.schema";
import type { ActionState } from "@/modules/students/student.actions";
import { useActionState, useState } from "react";

type Option = { id: string; label: string };

type ExistingSession = {
  id: string;
  studentId: string;
  subjectStudentId: string | null;
  counselingCategoryId: string;
  sessionDate: Date;
  startTime: string | null;
  endTime: string | null;
  purpose: string;
  riskLevel: string;
  status: string;
  followUpRequired: boolean;
  note: {
    presentationEngagement: string | null;
    emotionalAffect: string | null;
    credibilityObjectivity: string | null;
    credibilityRating: string | null;
    actionTaken: string | null;
    followUpNotes: string | null;
    summaryContext: string | null;
    summaryPeerDynamic: string | null;
    summaryConclusion: string | null;
  } | null;
  keyTakeaways: { title: string; body: string }[];
  timelineEvents: {
    phase: "BEFORE" | "DURING" | "AFTER" | "CUSTOM";
    title: string | null;
    body: string;
  }[];
  peerPerceptions: { title: string; body: string }[];
  groupObservations: { title: string; body: string }[];
  objectiveFindings: { title: string; body: string }[];
  riskAssessments: {
    riskDimensionId: string;
    subjectLabel: string | null;
    riskLevel: string;
    justification: string;
  }[];
  actionItems: { title: string; body: string; owner: string | null }[];
};

export function CounselingSessionForm({
  students,
  categories,
  riskDimensions,
  defaultStudentId,
  session,
}: {
  students: Option[];
  categories: Option[];
  riskDimensions: { id: string; name: string }[];
  defaultStudentId?: string;
  session?: ExistingSession;
}) {
  const isEditing = !!session;
  const boundAction = isEditing
    ? updateCounselingSessionAction.bind(null, session.id)
    : createCounselingSessionAction;
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    boundAction,
    undefined,
  );
  const [followUpRequired, setFollowUpRequired] = useState(
    session?.followUpRequired ?? false,
  );

  // Select.Root needs an `items` list to resolve the selected value's label
  // synchronously (on first paint, before the popup has ever been opened) —
  // without it, the trigger falls back to showing the raw id.
  const categoryItems = categories.map((c) => ({ value: c.id, label: c.label }));
  const riskLevelItems = RISK_LEVELS.map((level) => ({ value: level, label: level }));
  const statusItems = SESSION_STATUSES.map((s) => ({ value: s, label: s }));
  const credibilityRatingItems = CREDIBILITY_RATINGS.map((r) => ({ value: r, label: r }));

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field orientation='responsive'>
          <FieldLabel htmlFor='studentId'>Attending student</FieldLabel>
          <Combobox
            id='studentId'
            name='studentId'
            required
            defaultValue={session?.studentId ?? defaultStudentId}
            options={students}
            placeholder='Who was interviewed'
            searchPlaceholder='Search students...'
          />
        </Field>
        <Field orientation='responsive'>
          <FieldLabel htmlFor='subjectStudentId'>
            Subject student{" "}
            <span className='text-muted-foreground'>
              (optional — if the case is about someone else)
            </span>
          </FieldLabel>
          <Combobox
            id='subjectStudentId'
            name='subjectStudentId'
            defaultValue={session?.subjectStudentId ?? undefined}
            options={students}
            placeholder='Same as attending student'
            searchPlaceholder='Search students...'
          />
        </Field>
        <Field orientation='responsive'>
          <FieldLabel htmlFor='counselingCategoryId'>Category</FieldLabel>
          <Select
            name='counselingCategoryId'
            required
            defaultValue={session?.counselingCategoryId}
            items={categoryItems}
          >
            <SelectTrigger id='counselingCategoryId' className='w-full'>
              <SelectValue placeholder='Select a category' />
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
        <Field orientation='responsive'>
          <FieldLabel htmlFor='sessionDate'>Session date</FieldLabel>
          <Input
            id='sessionDate'
            name='sessionDate'
            type='date'
            required
            defaultValue={session?.sessionDate.toISOString().slice(0, 10)}
          />
        </Field>
        <div className='grid grid-cols-2 gap-4'>
          <Field>
            <FieldLabel htmlFor='startTime'>Start time</FieldLabel>
            <Input
              id='startTime'
              name='startTime'
              type='time'
              defaultValue={session?.startTime ?? undefined}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor='endTime'>End time</FieldLabel>
            <Input
              id='endTime'
              name='endTime'
              type='time'
              defaultValue={session?.endTime ?? undefined}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor='purpose'>Purpose</FieldLabel>
          <Textarea
            id='purpose'
            name='purpose'
            rows={2}
            required
            defaultValue={session?.purpose}
          />
        </Field>
        <div className='grid grid-cols-2 gap-4'>
          <Field>
            <FieldLabel htmlFor='riskLevel'>Risk level</FieldLabel>
            <Select
              name='riskLevel'
              defaultValue={session?.riskLevel ?? "LOW"}
              required
              items={riskLevelItems}
            >
              <SelectTrigger id='riskLevel' className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {riskLevelItems.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor='status'>Status</FieldLabel>
            <Select
              name='status'
              defaultValue={session?.status ?? "OPEN"}
              required
              items={statusItems}
            >
              <SelectTrigger id='status' className='w-full'>
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
        </div>

        <FieldSeparator>Section 1 — Presentation &amp; Demeanor</FieldSeparator>
        <Field>
          <FieldLabel htmlFor='presentationEngagement'>
            Presentation &amp; engagement
          </FieldLabel>
          <Textarea
            id='presentationEngagement'
            name='presentationEngagement'
            rows={2}
            defaultValue={session?.note?.presentationEngagement ?? undefined}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor='emotionalAffect'>Emotional affect</FieldLabel>
          <Textarea
            id='emotionalAffect'
            name='emotionalAffect'
            rows={2}
            defaultValue={session?.note?.emotionalAffect ?? undefined}
          />
        </Field>
        <div className='grid grid-cols-2 gap-4'>
          <Field>
            <FieldLabel htmlFor='credibilityObjectivity'>
              Credibility &amp; objectivity notes
            </FieldLabel>
            <Textarea
              id='credibilityObjectivity'
              name='credibilityObjectivity'
              rows={2}
              defaultValue={session?.note?.credibilityObjectivity ?? undefined}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor='credibilityRating'>
              Credibility rating
            </FieldLabel>
            <Select
              name='credibilityRating'
              defaultValue={session?.note?.credibilityRating ?? undefined}
              items={credibilityRatingItems}
            >
              <SelectTrigger id='credibilityRating' className='w-full'>
                <SelectValue placeholder='—' />
              </SelectTrigger>
              <SelectContent>
                {credibilityRatingItems.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <FieldSeparator>Section 2 — Student Session Narrative</FieldSeparator>
        <RepeatingTextFields
          name='keyTakeaways'
          label='Key Takeaways'
          description='Executive highlights of the session'
          initialRows={session?.keyTakeaways}
        />
        <TimelineEventsEditor
          name='timelineEvents'
          initialRows={session?.timelineEvents.map((e) => ({
            ...e,
            title: e.title ?? "",
          }))}
        />
        <RepeatingTextFields
          name='peerPerceptions'
          label='B. Peer Perceptions'
          initialRows={session?.peerPerceptions}
        />
        <RepeatingTextFields
          name='groupObservations'
          label='C. Group Coping Strategy'
          initialRows={session?.groupObservations}
        />

        <FieldSeparator>
          Section 3 — Objective Findings &amp; Risk Assessment
        </FieldSeparator>
        <RepeatingTextFields
          name='objectiveFindings'
          label='Objective Findings'
          initialRows={session?.objectiveFindings}
        />
        <RiskAssessmentsEditor
          name='riskAssessments'
          riskDimensions={riskDimensions}
          initialRows={session?.riskAssessments.map((r) => ({
            riskDimensionId: r.riskDimensionId,
            subjectLabel: r.subjectLabel ?? "",
            riskLevel: r.riskLevel as "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
            justification: r.justification,
          }))}
        />

        <ActionItemsEditor
          name='actionItems'
          initialRows={session?.actionItems.map((a) => ({
            ...a,
            owner: a.owner ?? "",
          }))}
        />

        <FieldSeparator>
          Section 5 — Counselor&apos;s Overall Summary
        </FieldSeparator>
        <Field>
          <FieldLabel htmlFor='summaryContext'>Context</FieldLabel>
          <Textarea
            id='summaryContext'
            name='summaryContext'
            rows={2}
            defaultValue={session?.note?.summaryContext ?? undefined}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor='summaryPeerDynamic'>Peer dynamic</FieldLabel>
          <Textarea
            id='summaryPeerDynamic'
            name='summaryPeerDynamic'
            rows={2}
            defaultValue={session?.note?.summaryPeerDynamic ?? undefined}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor='summaryConclusion'>Conclusion</FieldLabel>
          <Textarea
            id='summaryConclusion'
            name='summaryConclusion'
            rows={2}
            defaultValue={session?.note?.summaryConclusion ?? undefined}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor='actionTaken'>Action taken</FieldLabel>
          <Textarea
            id='actionTaken'
            name='actionTaken'
            rows={2}
            defaultValue={session?.note?.actionTaken ?? undefined}
          />
        </Field>

        <FieldSeparator />
        <Field orientation='horizontal'>
          <Checkbox
            id='followUpRequired'
            name='followUpRequired'
            checked={followUpRequired}
            onCheckedChange={(checked) => setFollowUpRequired(checked === true)}
          />
          <FieldLabel htmlFor='followUpRequired'>
            This session requires a follow-up
          </FieldLabel>
        </Field>
        {followUpRequired ? (
          <div className='grid grid-cols-2 gap-4 rounded-lg border p-3'>
            {isEditing ? (
              <p className='col-span-2 text-xs text-muted-foreground'>
                If a follow-up doesn&apos;t already exist for this session, fill
                these in to create one. Editing an existing follow-up is done
                from the Follow-ups page.
              </p>
            ) : null}
            <Field>
              <FieldLabel htmlFor='followUpTitle'>Follow-up title</FieldLabel>
              <Input
                id='followUpTitle'
                name='followUpTitle'
                required={followUpRequired && !isEditing}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor='followUpDueDate'>Due date</FieldLabel>
              <Input
                id='followUpDueDate'
                name='followUpDueDate'
                type='date'
                required={followUpRequired && !isEditing}
              />
            </Field>
          </div>
        ) : null}
        <Field>
          <FieldLabel htmlFor='followUpNotes'>Follow-up notes</FieldLabel>
          <Textarea
            id='followUpNotes'
            name='followUpNotes'
            rows={2}
            defaultValue={session?.note?.followUpNotes ?? undefined}
          />
        </Field>

        {state?.error ? <FieldError>{state.error}</FieldError> : null}
        <Button type='submit' disabled={isPending}>
          {isPending
            ? "Saving..."
            : isEditing
              ? "Save changes"
              : "Create session"}
        </Button>
      </FieldGroup>
    </form>
  );
}

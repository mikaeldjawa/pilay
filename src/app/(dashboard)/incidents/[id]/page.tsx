import { IncidentArchiveButton } from "@/components/incidents/incident-archive-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { INCIDENT_WORKFLOW_VARIANT } from "@/lib/status-colors";
import { formatStudentName } from "@/lib/utils";
import { findIncidentById } from "@/modules/incidents/incident.repository";
import { listGuardiansForStudent } from "@/modules/guardians/guardian.repository";
import { ParentContactCreateForm } from "@/components/students/parent-contact-create-form";
import { ParentContactArchiveButton } from "@/components/students/parent-contact-archive-button";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default async function IncidentDetailPage(
  props: PageProps<"/incidents/[id]">,
) {
  const { id } = await props.params;
  const incident = await findIncidentById(id);
  if (!incident) notFound();

  const guardians = await listGuardiansForStudent(incident.primaryStudent.id);

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <PageHeader
        title={incident.incidentNumber}
        titleBadges={
          <>
            <Badge variant={INCIDENT_WORKFLOW_VARIANT[incident.status]}>
              {incident.status.replaceAll("_", " ")}
            </Badge>
            {incident.deletedAt ? <Badge variant='destructive'>Archived</Badge> : null}
          </>
        }
        description={
          <>
            <span className='tabular-nums'>{incident.incidentDate.toLocaleDateString()}</span> —{" "}
            <Link
              href={`/students/${incident.primaryStudent.id}`}
              className='hover:underline'
            >
              {formatStudentName(incident.primaryStudent)}
            </Link>{" "}
            — {incident.incidentCategory.name}
          </>
        }
        actions={
          <>
            <Button
              variant='outline'
              render={<Link href={`/incidents/${incident.id}/edit`} />}
              nativeButton={false}
            >
              <Pencil />
              Edit
            </Button>
            {!incident.deletedAt && (
              <IncidentArchiveButton
                incidentId={incident.id}
                primaryStudentId={incident.primaryStudent.id}
                incidentNumber={incident.incidentNumber}
              />
            )}
          </>
        }
      />

      <Section title='Categories'>
        <div className='flex flex-wrap gap-2'>
          {incident.categorySelections.map((c) => (
            <Badge key={c.id} variant='secondary'>
              {c.incidentCategory.name}
            </Badge>
          ))}
        </div>
      </Section>

      <Section title='Individuals Involved'>
        <ul className='flex flex-col gap-1 text-sm'>
          {incident.participants.map((p) => (
            <li key={p.id}>
              <span className='font-medium'>
                {formatStudentName(p.student)}
              </span>{" "}
              — <Badge variant='outline'>{p.involvementType}</Badge>
              {p.notes ? ` — ${p.notes}` : ""}
            </li>
          ))}
          {incident.witnesses.map((w) => (
            <li key={w.id} className='text-muted-foreground'>
              {w.name} {w.role ? `(${w.role})` : ""} — witness
            </li>
          ))}
        </ul>
      </Section>

      <Section title='Factual Description'>
        <dl className='flex flex-col gap-3 text-sm'>
          <div>
            <dt className='text-muted-foreground'>Antecedent</dt>
            <dd>{incident.narrative?.antecedent}</dd>
          </div>
          <div>
            <dt className='text-muted-foreground'>Behavior</dt>
            <dd>{incident.narrative?.behavior}</dd>
          </div>
          <div>
            <dt className='text-muted-foreground'>Impact</dt>
            <dd>{incident.narrative?.impact}</dd>
          </div>
        </dl>
      </Section>

      <Section title='Immediate Action'>
        <ul className='flex flex-col gap-1 text-sm'>
          <li>
            Student escorted to office:{" "}
            {incident.response?.studentEscortedToOffice ? "Yes" : "No"}
          </li>
          <li>
            Classroom evacuated:{" "}
            {incident.response?.classroomEvacuated ? "Yes" : "No"}
          </li>
          <li>
            First aid / nurse requested:{" "}
            {incident.response?.firstAidOrNurseRequested ? "Yes" : "No"}
          </li>
          <li>
            On-site de-escalation by counselor:{" "}
            {incident.response?.onsiteDeescalationByCounselor ? "Yes" : "No"}
          </li>
        </ul>
      </Section>

      <Section title='Parent Contact Log'>
        <div className='flex flex-col gap-4'>
          <ul className='flex flex-col gap-2 text-sm'>
            {incident.parentContacts.map((c) => (
              <li key={c.id} className='flex items-start justify-between gap-2 rounded-lg border p-2 transition-colors hover:bg-muted/30'>
                <div>
                  <p className='text-muted-foreground'>
                    {c.contactDate.toLocaleDateString()} — {c.method} — {c.guardian.fullName}
                  </p>
                  <p>{c.summary}</p>
                  {c.outcome ? <p className='text-muted-foreground'>Outcome: {c.outcome}</p> : null}
                </div>
                <ParentContactArchiveButton
                  contactId={c.id}
                  studentId={incident.primaryStudent.id}
                  additionalRevalidatePath={`/incidents/${incident.id}`}
                />
              </li>
            ))}
            {incident.parentContacts.length === 0 && (
              <p className='text-muted-foreground'>No parent contact logged for this incident yet.</p>
            )}
          </ul>
          {guardians.length > 0 ? (
            <ParentContactCreateForm
              studentId={incident.primaryStudent.id}
              guardians={guardians.map((g) => ({ id: g.guardianId, label: g.guardian.fullName }))}
              relatedIncidentId={incident.id}
            />
          ) : (
            <p className='text-sm text-muted-foreground'>
              Add a guardian on the student&apos;s page first to log a contact here.
            </p>
          )}
        </div>
      </Section>

      <Section title='Sign-Off'>
        <ul className='flex flex-col gap-1 text-sm'>
          {incident.signoffs.map((s) => (
            <li key={s.id}>
              {s.role}: {s.signerName ?? "—"}{" "}
              {s.signedAt ? `(${s.signedAt.toLocaleString()})` : ""}
            </li>
          ))}
          {incident.signoffs.length === 0 && (
            <p className='text-muted-foreground'>No sign-offs recorded.</p>
          )}
        </ul>
      </Section>
    </div>
  );
}

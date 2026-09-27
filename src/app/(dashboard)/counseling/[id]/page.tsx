import { CounselingSessionArchiveButton } from "@/components/counseling/counseling-session-archive-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { RISK_STATUS, SESSION_STATUS_VARIANT } from "@/lib/status-colors";
import { formatStudentName } from "@/lib/utils";
import { findCounselingSessionById } from "@/modules/counseling/counseling.repository";
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

export default async function CounselingSessionDetailPage(
  props: PageProps<"/counseling/[id]">,
) {
  const { id } = await props.params;
  const session = await findCounselingSessionById(id);
  if (!session) notFound();

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <PageHeader
        title={
          <Link href={`/students/${session.student.id}`} className='hover:underline'>
            {formatStudentName(session.student)}
          </Link>
        }
        titleBadges={
          <>
            <StatusBadge level={RISK_STATUS[session.riskLevel]} label={session.riskLevel} />
            <Badge variant={SESSION_STATUS_VARIANT[session.status]}>
              {session.status.replaceAll("_", " ")}
            </Badge>
            {session.deletedAt ? <Badge variant='destructive'>Archived</Badge> : null}
          </>
        }
        description={
          <>
            <span className='tabular-nums'>{session.sessionDate.toLocaleDateString()}</span> —{" "}
            {session.counselingCategory.name}
            {session.subjectStudent
              ? ` — Subject: ${formatStudentName(session.subjectStudent)}`
              : ""}
          </>
        }
        actions={
          <>
            <Button
              variant='outline'
              render={<Link href={`/counseling/${session.id}/edit`} />}
              nativeButton={false}
            >
              <Pencil />
              Edit
            </Button>
            {!session.deletedAt && (
              <CounselingSessionArchiveButton
                sessionId={session.id}
                studentId={session.student.id}
              />
            )}
          </>
        }
      />

      <Section title='Purpose'>
        <p className='text-sm'>{session.purpose}</p>
      </Section>

      <Section title='Section 1 — Presentation & Demeanor'>
        <dl className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <dt className='text-muted-foreground'>
              Presentation &amp; engagement
            </dt>
            <dd>{session.note?.presentationEngagement ?? "—"}</dd>
          </div>
          <div>
            <dt className='text-muted-foreground'>Emotional affect</dt>
            <dd>{session.note?.emotionalAffect ?? "—"}</dd>
          </div>
          <div>
            <dt className='text-muted-foreground'>
              Credibility &amp; objectivity
            </dt>
            <dd>{session.note?.credibilityObjectivity ?? "—"}</dd>
          </div>
          <div>
            <dt className='text-muted-foreground'>Credibility rating</dt>
            <dd>{session.note?.credibilityRating ?? "—"}</dd>
          </div>
        </dl>
      </Section>

      <Section title='Section 2 — Student Session Narrative'>
        <div className='flex flex-col gap-4 text-sm'>
          <div>
            <p className='font-medium'>Key Takeaways</p>
            <ol className='list-decimal pl-5'>
              {session.keyTakeaways.map((t) => (
                <li key={t.id}>
                  <span className='font-medium'>{t.title}</span> — {t.body}
                </li>
              ))}
              {session.keyTakeaways.length === 0 && (
                <p className='text-muted-foreground'>—</p>
              )}
            </ol>
          </div>
          <div>
            <p className='font-medium'>A. Timeline</p>
            <ol className='list-decimal pl-5'>
              {session.timelineEvents.map((t) => (
                <li key={t.id}>
                  <span className='font-medium'>[{t.phase}]</span>{" "}
                  {t.title ? `${t.title} — ` : ""}
                  {t.body}
                </li>
              ))}
              {session.timelineEvents.length === 0 && (
                <p className='text-muted-foreground'>—</p>
              )}
            </ol>
          </div>
          <div>
            <p className='font-medium'>B. Peer Perceptions</p>
            <ol className='list-decimal pl-5'>
              {session.peerPerceptions.map((t) => (
                <li key={t.id}>
                  <span className='font-medium'>{t.title}</span> — {t.body}
                </li>
              ))}
              {session.peerPerceptions.length === 0 && (
                <p className='text-muted-foreground'>—</p>
              )}
            </ol>
          </div>
          <div>
            <p className='font-medium'>C. Group Coping Strategy</p>
            <ol className='list-decimal pl-5'>
              {session.groupObservations.map((t) => (
                <li key={t.id}>
                  <span className='font-medium'>{t.title}</span> — {t.body}
                </li>
              ))}
              {session.groupObservations.length === 0 && (
                <p className='text-muted-foreground'>—</p>
              )}
            </ol>
          </div>
        </div>
      </Section>

      <Section title='Section 3 — Objective Findings & Risk Assessment'>
        <div className='grid grid-cols-2 gap-6 text-sm'>
          <div>
            <p className='font-medium'>Objective Findings</p>
            <ol className='list-decimal pl-5'>
              {session.objectiveFindings.map((t) => (
                <li key={t.id}>
                  <span className='font-medium'>{t.title}</span> — {t.body}
                </li>
              ))}
              {session.objectiveFindings.length === 0 && (
                <p className='text-muted-foreground'>—</p>
              )}
            </ol>
          </div>
          <div>
            <p className='font-medium'>Risk Assessment</p>
            <ul className='flex flex-col gap-1'>
              {session.riskAssessments.map((r) => (
                <li key={r.id}>
                  <span className='font-medium'>{r.riskDimension.name}:</span>{" "}
                  <Badge variant='outline'>{r.riskLevel}</Badge>{" "}
                  {r.justification}
                </li>
              ))}
              {session.riskAssessments.length === 0 && (
                <p className='text-muted-foreground'>—</p>
              )}
            </ul>
          </div>
        </div>
      </Section>

      <Section title='Section 4 — Action Plan / Recommendations'>
        <ol className='list-decimal pl-5 text-sm'>
          {session.actionItems.map((a) => (
            <li key={a.id}>
              <span className='font-medium'>{a.title}</span>
              {a.owner ? ` (${a.owner})` : ""} — {a.body}
            </li>
          ))}
          {session.actionItems.length === 0 && (
            <p className='text-muted-foreground'>—</p>
          )}
        </ol>
      </Section>

      <Section title="Section 5 — Counselor's Overall Summary">
        <dl className='flex flex-col gap-3 text-sm'>
          <div>
            <dt className='text-muted-foreground'>Context</dt>
            <dd>{session.note?.summaryContext ?? "—"}</dd>
          </div>
          <div>
            <dt className='text-muted-foreground'>Peer dynamic</dt>
            <dd>{session.note?.summaryPeerDynamic ?? "—"}</dd>
          </div>
          <div>
            <dt className='text-muted-foreground'>Conclusion</dt>
            <dd>{session.note?.summaryConclusion ?? "—"}</dd>
          </div>
          <div>
            <dt className='text-muted-foreground'>Action taken</dt>
            <dd>{session.note?.actionTaken ?? "—"}</dd>
          </div>
        </dl>
      </Section>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate } from "@/lib/date";
import { findWeekById } from "@/modules/teaching-plans/teaching-plan.repository";
import { BookOpen, FileText, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function TeachingPlanWeekPage(
  props: PageProps<"/teaching-plans/[id]/weeks/[weekId]">,
) {
  const { id, weekId } = await props.params;
  const week = await findWeekById(weekId);
  if (!week || week.teachingPlanId !== id) notFound();

  const plan = week.teachingPlan;
  const isPlanned = !!week.topic;
  const editHref = `/teaching-plans/${id}/weeks/${week.id}/edit`;
  const dateRange =
    week.startDate && week.endDate
      ? `${formatDate(week.startDate)} – ${formatDate(week.endDate)}`
      : null;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader
        title={`Week ${week.weekNumber}`}
        titleBadges={
          isPlanned ? (
            <Badge variant="outline">Planned</Badge>
          ) : (
            <Badge variant="secondary">Not planned</Badge>
          )
        }
        description={
          <>
            <Link href={`/teaching-plans/${id}`} className="hover:underline">
              {plan.subject.name} — {plan.class.name}
            </Link>{" "}
            · {plan.academicYear.name} · Semester {plan.semester}
            {dateRange ? ` · ${dateRange}` : ""}
          </>
        }
        actions={
          <Button
            variant="outline"
            render={<Link href={editHref} />}
            nativeButton={false}
          >
            <Pencil />
            Edit
          </Button>
        }
      />

      {!isPlanned ? (
        <Card>
          <CardContent>
            <EmptyState
              illustration="quiet"
              title="This week isn't planned yet"
              description="Add a topic, learning objective, lessons, and materials to plan this week."
              action={
                <Button render={<Link href={editHref} />} nativeButton={false}>
                  <Plus />
                  Create plan
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Topic</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm">
              <p className="text-base font-semibold">{week.topic}</p>
              <div>
                <p className="text-muted-foreground">Learning objective</p>
                <p>{week.learningObjective ?? "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Detail plan</p>
                {week.detailPlan ? (
                  <p className="whitespace-pre-wrap">{week.detailPlan}</p>
                ) : (
                  <p>—</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Lessons ({week.lessons.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {week.lessons.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No lessons for this topic yet.
                </p>
              ) : (
                week.lessons.map((lesson, i) => (
                  <div key={lesson.id} className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full border bg-background">
                        <BookOpen className="size-3 text-muted-foreground" />
                      </span>
                      <p className="font-medium">
                        {i + 1}. {lesson.title}
                      </p>
                    </div>
                    {lesson.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {lesson.description}
                      </p>
                    ) : null}
                    {lesson.content ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm">
                        {lesson.content}
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Materials ({week.materials.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2">
                {week.materials.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center gap-2 rounded-lg border p-2 text-sm"
                  >
                    <a
                      href={`/api/documents/${m.id}/download`}
                      className="flex min-w-0 items-center gap-2 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FileText className="size-4 shrink-0" />
                      <span className="truncate">{m.title}</span>
                    </a>
                  </li>
                ))}
                {week.materials.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No materials attached yet.
                  </p>
                ) : null}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

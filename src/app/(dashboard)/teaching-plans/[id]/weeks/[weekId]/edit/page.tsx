import { MaterialRemoveButton } from "@/components/teaching-plans/material-remove-button";
import { MaterialUploadForm } from "@/components/teaching-plans/material-upload-form";
import { WeekEditorForm } from "@/components/teaching-plans/week-editor-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { findWeekById } from "@/modules/teaching-plans/teaching-plan.repository";
import { FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditTeachingPlanWeekPage(
  props: PageProps<"/teaching-plans/[id]/weeks/[weekId]/edit">,
) {
  const { id, weekId } = await props.params;
  const week = await findWeekById(weekId);
  if (!week || week.teachingPlanId !== id) notFound();

  const plan = week.teachingPlan;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader
        title={`Edit Week ${week.weekNumber}`}
        description={
          <>
            <Link href={`/teaching-plans/${id}`} className="hover:underline">
              {plan.subject.name} — {plan.class.name}
            </Link>{" "}
            · {plan.academicYear.name} · Semester {plan.semester}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly plan</CardTitle>
          </CardHeader>
          <CardContent>
            <WeekEditorForm
              planId={id}
              weekId={week.id}
              topic={week.topic}
              learningObjective={week.learningObjective}
              detailPlan={week.detailPlan}
              lessons={week.lessons.map((l) => ({
                title: l.title,
                description: l.description ?? "",
                content: l.content ?? "",
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Materials</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ul className="flex flex-col gap-2">
              {week.materials.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-2 rounded-lg border p-2 text-sm"
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
                  <MaterialRemoveButton
                    planId={id}
                    weekId={week.id}
                    documentId={m.id}
                    fileName={m.fileName}
                  />
                </li>
              ))}
              {week.materials.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No materials attached yet.
                </p>
              ) : null}
            </ul>

            <MaterialUploadForm planId={id} weekId={week.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

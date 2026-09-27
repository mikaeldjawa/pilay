import { TeachingPlanArchiveButton } from "@/components/teaching-plans/teaching-plan-archive-button";
import { TeachingPlanTimeline } from "@/components/teaching-plans/teaching-plan-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { findTeachingPlanById } from "@/modules/teaching-plans/teaching-plan.repository";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function TeachingPlanDetailPage(
  props: PageProps<"/teaching-plans/[id]">,
) {
  const { id } = await props.params;
  const plan = await findTeachingPlanById(id);
  if (!plan) notFound();

  const plannedWeeks = plan.weeks.filter((w) => w.topic).length;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader
        title={`${plan.subject.name} — ${plan.class.name}`}
        titleBadges={<Badge variant="outline">Semester {plan.semester}</Badge>}
        description={
          <>
            {plan.academicYear.name} · Teacher: {plan.teacher.fullName} ·{" "}
            <span className="tabular-nums">
              {plannedWeeks} / {plan.weekCount} weeks planned
            </span>
          </>
        }
        actions={
          <>
            <Button
              variant="outline"
              render={<Link href={`/teaching-plans/${plan.id}/edit`} />}
              nativeButton={false}
            >
              <Pencil />
              Edit
            </Button>
            <TeachingPlanArchiveButton planId={plan.id} />
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Semester timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <TeachingPlanTimeline planId={plan.id} weeks={plan.weeks} />
        </CardContent>
      </Card>
    </div>
  );
}

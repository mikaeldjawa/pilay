import { TeachingPlanForm } from "@/components/teaching-plans/teaching-plan-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { findTeachingPlanById } from "@/modules/teaching-plans/teaching-plan.repository";
import { notFound } from "next/navigation";

export default async function EditTeachingPlanPage(
  props: PageProps<"/teaching-plans/[id]/edit">,
) {
  const { id } = await props.params;
  const plan = await findTeachingPlanById(id);
  if (!plan) notFound();

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Edit teaching plan
        </h1>
        <p className="text-sm text-muted-foreground">
          {plan.subject.name} — {plan.class.name} · {plan.academicYear.name} ·
          Semester {plan.semester}
        </p>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Plan details</CardTitle>
        </CardHeader>
        <CardContent>
          {/* The class/subject/year/semester/teacher are fixed after creation —
              only title and description are editable here. */}
          <TeachingPlanForm
            academicYears={[]}
            classes={[]}
            subjects={[]}
            teachers={[]}
            plan={{ id: plan.id, title: plan.title, description: plan.description }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

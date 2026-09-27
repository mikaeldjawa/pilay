import { TeachingPlanForm } from "@/components/teaching-plans/teaching-plan-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import {
  listAcademicYears,
  listClasses,
  listSubjects,
  listTeachers,
} from "@/modules/teaching-plans/teaching-plan.repository";

export default async function NewTeachingPlanPage() {
  const session = await auth();
  const [academicYears, classes, subjects, teachers] = await Promise.all([
    listAcademicYears(),
    listClasses(),
    listSubjects(),
    listTeachers(),
  ]);

  const currentYear = academicYears.find((y) => y.isCurrent) ?? academicYears[0];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New teaching plan</h1>
        <p className="text-sm text-muted-foreground">
          Pick the class and semester — the weekly plan slots are generated
          automatically once you create the plan.
        </p>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Plan details</CardTitle>
        </CardHeader>
        <CardContent>
          <TeachingPlanForm
            academicYears={academicYears.map((y) => ({ id: y.id, label: y.name }))}
            classes={classes.map((c) => ({
              id: c.id,
              label: `${c.name} (${c.academicYear.name})`,
            }))}
            subjects={subjects.map((s) => ({ id: s.id, label: s.name }))}
            teachers={teachers.map((t) => ({ id: t.id, label: t.fullName }))}
            defaultTeacherId={session?.user?.id}
            defaultAcademicYearId={currentYear?.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}

import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CounselingSessionForm } from "@/components/counseling/counseling-session-form";
import {
  findCounselingSessionById,
  listCounselingCategories,
  listRiskDimensions,
} from "@/modules/counseling/counseling.repository";
import { listStudents } from "@/modules/students/student.repository";
import { formatStudentName, mergeOptionalOptions } from "@/lib/utils";

export default async function EditCounselingSessionPage(props: PageProps<"/counseling/[id]/edit">) {
  const { id } = await props.params;

  const [session, { students }, activeCategories, activeRiskDimensions] = await Promise.all([
    findCounselingSessionById(id),
    listStudents({ pageSize: 500 }),
    listCounselingCategories(),
    listRiskDimensions(),
  ]);

  if (!session) notFound();

  // The session's category/risk dimensions may have since been deactivated
  // in Settings — include them anyway so the form can still resolve them to
  // a label instead of falling back to their raw id.
  const categories = mergeOptionalOptions(activeCategories, [session.counselingCategory]);
  const riskDimensions = mergeOptionalOptions(
    activeRiskDimensions,
    session.riskAssessments.map((r) => r.riskDimension),
  );

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Edit session — {formatStudentName(session.student)}
        </h1>
      </div>
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Session details</CardTitle>
        </CardHeader>
        <CardContent>
          <CounselingSessionForm
            students={students.map((s) => ({ id: s.id, label: `${formatStudentName(s)} (${s.studentId})` }))}
            categories={categories.map((c) => ({ id: c.id, label: c.name }))}
            riskDimensions={riskDimensions}
            session={session}
          />
        </CardContent>
      </Card>
    </div>
  );
}

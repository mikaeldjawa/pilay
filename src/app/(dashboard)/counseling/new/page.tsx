import { CounselingSessionForm } from "@/components/counseling/counseling-session-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  listCounselingCategories,
  listRiskDimensions,
} from "@/modules/counseling/counseling.repository";
import { listStudents } from "@/modules/students/student.repository";
import { formatStudentName } from "@/lib/utils";

export default async function NewCounselingSessionPage(
  props: PageProps<"/counseling/new">,
) {
  const searchParams = await props.searchParams;
  const defaultStudentId =
    typeof searchParams.studentId === "string"
      ? searchParams.studentId
      : undefined;

  const [{ students }, categories, riskDimensions] = await Promise.all([
    listStudents({ pageSize: 500 }),
    listCounselingCategories(),
    listRiskDimensions(),
  ]);

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>
          New counseling session
        </h1>
        <p className='text-sm text-muted-foreground'>
          Structured entry mirrors the Confidential Counseling Report so reports
          can be generated directly from this session later.
        </p>
      </div>
      <Card className='max-w-3xl'>
        <CardHeader>
          <CardTitle>Session details</CardTitle>
        </CardHeader>
        <CardContent>
          <CounselingSessionForm
            students={students.map((s) => ({
              id: s.id,
              label: `${formatStudentName(s)} (${s.studentId})`,
            }))}
            categories={categories.map((c) => ({ id: c.id, label: c.name }))}
            riskDimensions={riskDimensions}
            defaultStudentId={defaultStudentId}
          />
        </CardContent>
      </Card>
    </div>
  );
}

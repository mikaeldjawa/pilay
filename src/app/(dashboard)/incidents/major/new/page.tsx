import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MajorIncidentForm } from "@/components/incidents/major-incident-form";
import { listIncidentCategories } from "@/modules/incidents/incident.repository";
import { listStudents } from "@/modules/students/student.repository";
import { formatStudentName } from "@/lib/utils";

export default async function NewMajorIncidentPage(props: PageProps<"/incidents/major/new">) {
  const searchParams = await props.searchParams;
  const defaultStudentId = typeof searchParams.studentId === "string" ? searchParams.studentId : undefined;
  const defaultEscalateBehaviorRecordIds =
    typeof searchParams.escalateBehaviorRecordIds === "string"
      ? searchParams.escalateBehaviorRecordIds.split(",").filter(Boolean)
      : undefined;

  const [{ students }, categories] = await Promise.all([
    listStudents({ pageSize: 500 }),
    listIncidentCategories(),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Major incident report</h1>
        <p className="text-sm text-muted-foreground">
          Mirrors the Incident Logbook Section B.
        </p>
      </div>
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Incident details</CardTitle>
        </CardHeader>
        <CardContent>
          <MajorIncidentForm
            students={students.map((s) => ({ id: s.id, label: `${formatStudentName(s)} (${s.studentId})` }))}
            categories={categories}
            defaultStudentId={defaultStudentId}
            defaultEscalateBehaviorRecordIds={defaultEscalateBehaviorRecordIds}
          />
        </CardContent>
      </Card>
    </div>
  );
}

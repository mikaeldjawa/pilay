import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MinorBehaviorQuickForm } from "@/components/behavior/minor-behavior-quick-form";
import { listBehaviorCategories, listActionCodes } from "@/modules/behavior/behavior.repository";
import { listStudents } from "@/modules/students/student.repository";
import { formatStudentName } from "@/lib/utils";

export default async function NewMinorBehaviorPage() {
  const [{ students }, behaviorCategories, actionCodes] = await Promise.all([
    listStudents({ pageSize: 500 }),
    listBehaviorCategories(),
    listActionCodes(),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Log minor behavior</h1>
        <p className="text-sm text-muted-foreground">
          Tick-and-go entry matching the Incident Logbook Section A grid.
        </p>
      </div>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Quick entry</CardTitle>
        </CardHeader>
        <CardContent>
          <MinorBehaviorQuickForm
            students={students.map((s) => ({ id: s.id, label: `${formatStudentName(s)} (${s.studentId})` }))}
            behaviorCategories={behaviorCategories}
            actionCodes={actionCodes}
          />
        </CardContent>
      </Card>
    </div>
  );
}

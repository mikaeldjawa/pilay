import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GenerateCounselingReportForm } from "@/components/reports/generate-counseling-report-form";
import { GenerateIncidentReportForm } from "@/components/reports/generate-incident-report-form";
import { GenerateBehaviorLogForm } from "@/components/reports/generate-behavior-log-form";
import { GenerateStudentIncidentHistoryForm } from "@/components/reports/generate-student-incident-history-form";
import { db } from "@/lib/db";
import { formatStudentName } from "@/lib/utils";
import { listClasses, listStudents } from "@/modules/students/student.repository";

// Headless Chromium PDF rendering (see pdf.service.ts) can take longer than
// the platform's default Server Action timeout, especially cold-starting the
// browser binary on a serverless function.
export const maxDuration = 60;

const TITLES: Record<string, string> = {
  COUNSELING_CASE: "Generate: Case/Incident Counseling Report",
  INCIDENT_MAJOR: "Generate: Major Incident Report",
  BEHAVIOR_LOG_MINOR: "Generate: Minor Behavior Log",
  STUDENT_SUMMARY: "Generate: Student Full Report",
};

export default async function NewReportPage(props: PageProps<"/reports/new">) {
  const searchParams = await props.searchParams;
  const type = typeof searchParams.type === "string" ? searchParams.type : "COUNSELING_CASE";
  const studentId = typeof searchParams.studentId === "string" ? searchParams.studentId : undefined;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{TITLES[type] ?? "Generate report"}</h1>
      </div>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Report parameters</CardTitle>
        </CardHeader>
        <CardContent>
          {type === "COUNSELING_CASE" ? <CounselingCasePicker /> : null}
          {type === "INCIDENT_MAJOR" ? <IncidentPicker /> : null}
          {type === "BEHAVIOR_LOG_MINOR" ? <BehaviorLogPicker /> : null}
          {type === "STUDENT_SUMMARY" ? (
            <StudentIncidentHistoryPicker defaultStudentId={studentId} />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

async function CounselingCasePicker() {
  const sessions = await db.counselingSession.findMany({
    where: { deletedAt: null },
    include: { student: true, subjectStudent: true },
    orderBy: { sessionDate: "desc" },
    take: 100,
  });

  return (
    <GenerateCounselingReportForm
      sessions={sessions.map((s) => ({
        id: s.id,
        label: `${s.sessionDate.toLocaleDateString()} — ${formatStudentName(s.subjectStudent ?? s.student)}`,
      }))}
    />
  );
}

async function BehaviorLogPicker() {
  const classes = await listClasses();

  return (
    <GenerateBehaviorLogForm
      classes={classes.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}

async function StudentIncidentHistoryPicker({ defaultStudentId }: { defaultStudentId?: string }) {
  const { students } = await listStudents({ pageSize: 500 });

  return (
    <GenerateStudentIncidentHistoryForm
      students={students.map((s) => ({ id: s.id, label: `${formatStudentName(s)} (${s.studentId})` }))}
      defaultStudentId={defaultStudentId}
    />
  );
}

async function IncidentPicker() {
  const incidents = await db.incident.findMany({
    where: { deletedAt: null },
    include: { primaryStudent: true },
    orderBy: { incidentDate: "desc" },
    take: 100,
  });

  return (
    <GenerateIncidentReportForm
      incidents={incidents.map((i) => ({
        id: i.id,
        label: `${i.incidentNumber} — ${formatStudentName(i.primaryStudent)}`,
      }))}
    />
  );
}

import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MajorIncidentForm } from "@/components/incidents/major-incident-form";
import { findIncidentById, listIncidentCategories } from "@/modules/incidents/incident.repository";
import { listStudents } from "@/modules/students/student.repository";
import { formatStudentName, mergeOptionalOptions } from "@/lib/utils";

export default async function EditMajorIncidentPage(props: PageProps<"/incidents/[id]/edit">) {
  const { id } = await props.params;

  const [incident, { students }, activeCategories] = await Promise.all([
    findIncidentById(id),
    listStudents({ pageSize: 500 }),
    listIncidentCategories(),
  ]);

  if (!incident) notFound();

  // A category referenced by this incident (primary or additional) may have
  // since been deactivated in Settings — include it anyway so the form can
  // still resolve it to a label instead of falling back to its raw id.
  const categories = mergeOptionalOptions(activeCategories, [
    incident.incidentCategory,
    ...incident.categorySelections.map((s) => s.incidentCategory),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit {incident.incidentNumber}</h1>
      </div>
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Incident details</CardTitle>
        </CardHeader>
        <CardContent>
          <MajorIncidentForm
            students={students.map((s) => ({ id: s.id, label: `${formatStudentName(s)} (${s.studentId})` }))}
            categories={categories}
            incident={incident}
          />
        </CardContent>
      </Card>
    </div>
  );
}

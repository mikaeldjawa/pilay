import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentEditForm } from "@/components/students/student-edit-form";
import { findStudentById } from "@/modules/students/student.repository";
import { formatStudentName } from "@/lib/utils";

export default async function EditStudentPage(props: PageProps<"/students/[id]/edit">) {
  const { id } = await props.params;
  const student = await findStudentById(id);
  if (!student) notFound();

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Edit {formatStudentName(student)}
        </h1>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Student details</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentEditForm student={student} />
        </CardContent>
      </Card>
    </div>
  );
}

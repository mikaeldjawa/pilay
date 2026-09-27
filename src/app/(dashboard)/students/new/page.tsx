import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentForm } from "@/components/students/student-form";
import { listGrades, listClasses, getCurrentAcademicYear } from "@/modules/students/student.repository";

export default async function NewStudentPage() {
  const academicYear = await getCurrentAcademicYear();
  const [grades, classes] = await Promise.all([
    listGrades(),
    listClasses(academicYear?.id),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New student</h1>
        <p className="text-sm text-muted-foreground">
          Creates the student record and enrolls them in the current academic year.
        </p>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Student details</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentForm grades={grades} classes={classes} />
        </CardContent>
      </Card>
    </div>
  );
}

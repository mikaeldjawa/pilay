import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormFieldsSkeleton } from "@/components/ui/form-page-skeleton";

export default function NewStudentLoading() {
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
          <FormFieldsSkeleton fields={6} columns={2} />
        </CardContent>
      </Card>
    </div>
  );
}

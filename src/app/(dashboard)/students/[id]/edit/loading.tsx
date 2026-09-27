import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormFieldsSkeleton } from "@/components/ui/form-page-skeleton";

export default function EditStudentLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          <Skeleton className="h-7 w-56" />
        </h1>
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

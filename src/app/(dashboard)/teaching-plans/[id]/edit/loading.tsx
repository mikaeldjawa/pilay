import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormFieldsSkeleton } from "@/components/ui/form-page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditTeachingPlanLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit teaching plan</h1>
        <Skeleton className="mt-1 h-4 w-72" />
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Plan details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <FormFieldsSkeleton fields={2} columns={1} />
          <Skeleton className="h-9 w-32" />
        </CardContent>
      </Card>
    </div>
  );
}

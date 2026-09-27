import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormFieldsSkeleton } from "@/components/ui/form-page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewTeachingPlanLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New teaching plan</h1>
        <p className="text-sm text-muted-foreground">
          Pick the class and semester — the weekly plan slots are generated
          automatically once you create the plan.
        </p>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Plan details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <FormFieldsSkeleton fields={5} columns={1} />
          <FormFieldsSkeleton fields={2} columns={2} />
          <Skeleton className="h-9 w-32" />
        </CardContent>
      </Card>
    </div>
  );
}

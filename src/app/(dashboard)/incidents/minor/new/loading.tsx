import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormFieldsSkeleton } from "@/components/ui/form-page-skeleton";

export default function NewMinorBehaviorLoading() {
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
        <CardContent className="flex flex-col gap-4">
          <FormFieldsSkeleton fields={1} columns={1} />
          <Skeleton className="h-20 w-full" />
          <FormFieldsSkeleton fields={2} columns={2} />
          <FormFieldsSkeleton fields={1} columns={1} />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

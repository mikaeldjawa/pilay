import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormFieldsSkeleton } from "@/components/ui/form-page-skeleton";

export default function NewMajorIncidentLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Major incident report</h1>
        <p className="text-sm text-muted-foreground">Mirrors the Incident Logbook Section B.</p>
      </div>
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Incident details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <FormFieldsSkeleton fields={4} columns={2} />
          <Skeleton className="h-5 w-48" />
          <FormFieldsSkeleton fields={4} columns={2} />
          <Skeleton className="h-5 w-40" />
          <FormFieldsSkeleton fields={3} columns={1} />
          <Skeleton className="h-5 w-56" />
          <FormFieldsSkeleton fields={4} columns={2} />
        </CardContent>
      </Card>
    </div>
  );
}

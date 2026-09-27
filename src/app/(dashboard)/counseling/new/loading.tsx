import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormFieldsSkeleton } from "@/components/ui/form-page-skeleton";

export default function NewCounselingSessionLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New counseling session</h1>
        <p className="text-sm text-muted-foreground">
          Structured entry mirrors the Confidential Counseling Report so reports can be generated
          directly from this session later.
        </p>
      </div>
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Session details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <FormFieldsSkeleton fields={4} columns={2} />
          <Skeleton className="h-5 w-48" />
          <FormFieldsSkeleton fields={3} columns={1} />
          <Skeleton className="h-5 w-56" />
          <FormFieldsSkeleton fields={4} columns={2} />
          <Skeleton className="h-5 w-40" />
          <FormFieldsSkeleton fields={3} columns={1} />
        </CardContent>
      </Card>
    </div>
  );
}

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeachingPlanDetailLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader
        title={<Skeleton as="span" className="h-7 w-64" />}
        description={<Skeleton as="span" className="h-4 w-72" />}
        actions={<Skeleton className="h-9 w-40" />}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Semester timeline</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-1.5 w-full" />
          <div className="flex flex-col gap-3 border-l pl-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

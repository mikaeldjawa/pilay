import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeachingPlanWeekLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader
        title={<Skeleton as="span" className="h-7 w-28" />}
        description={<Skeleton as="span" className="h-4 w-72" />}
        actions={<Skeleton className="h-9 w-20" />}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Topic</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lessons</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

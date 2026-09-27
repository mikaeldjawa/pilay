import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

export default function IncidentDetailLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader
        title={<Skeleton className="h-7 w-40" />}
        description={<Skeleton as="span" className="h-4 w-64" />}
        actions={
          <>
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </>
        }
      />
      <SectionSkeleton rows={1} />
      <SectionSkeleton rows={3} />
      <SectionSkeleton rows={3} />
      <SectionSkeleton rows={4} />
      <SectionSkeleton rows={2} />
      <SectionSkeleton rows={2} />
    </div>
  );
}

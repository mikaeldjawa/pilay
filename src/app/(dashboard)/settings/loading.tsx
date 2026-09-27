import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card className="bg-muted/20">
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

export default function SettingsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader title="Settings" description="System configuration and reference data." />

      <SectionSkeleton rows={3} />
      <SectionSkeleton rows={4} />

      <div className="grid grid-cols-2 gap-4">
        <SectionSkeleton rows={4} />
        <SectionSkeleton rows={4} />
      </div>

      <SectionSkeleton rows={4} />

      <div className="grid grid-cols-2 gap-4">
        <SectionSkeleton rows={4} />
        <SectionSkeleton rows={4} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SectionSkeleton rows={4} />
        <SectionSkeleton rows={4} />
      </div>
    </div>
  );
}

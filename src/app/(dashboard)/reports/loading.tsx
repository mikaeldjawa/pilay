import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ListPanelSkeleton } from "@/components/ui/list-page-skeleton";

export default function ReportsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader title="Reports" description="Generate and review official reports." />

      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="mb-2 h-5 w-5" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-1 h-3 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      <ListPanelSkeleton columns={5} filters={2} />
    </div>
  );
}

import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportDetailLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader
        title={<Skeleton className="h-7 w-56" />}
        titleBadges={<Skeleton className="h-5 w-16" />}
        description={<Skeleton as="span" className="h-4 w-64" />}
      />
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-base">Document</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <Skeleton className="h-[80vh] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

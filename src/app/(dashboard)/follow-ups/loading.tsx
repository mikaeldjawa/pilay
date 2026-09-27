import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListPanelSkeleton } from "@/components/ui/list-page-skeleton";

export default function FollowUpsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader title="Follow-ups" description={<Skeleton as="span" className="h-4 w-32" />} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add follow-up</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
      <ListPanelSkeleton columns={6} filters={2} />
    </div>
  );
}

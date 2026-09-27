import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ListPanelSkeleton,
  TabsBarSkeleton,
} from "@/components/ui/list-page-skeleton";

export default function IncidentsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader
        title="Incidents"
        description={<Skeleton as="span" className="h-4 w-40" />}
        actions={<Skeleton className="h-9 w-24" />}
      />
      <TabsBarSkeleton count={3} />
      <ListPanelSkeleton columns={6} filters={3} />
    </div>
  );
}

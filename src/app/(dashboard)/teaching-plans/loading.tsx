import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ListPanelSkeleton } from "@/components/ui/list-page-skeleton";

export default function TeachingPlansLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader
        title="Teaching Plans"
        description={<Skeleton as="span" className="h-4 w-24" />}
        actions={<Skeleton className="h-9 w-44" />}
      />
      <ListPanelSkeleton columns={4} filters={4} />
    </div>
  );
}

import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ListPanelSkeleton } from "@/components/ui/list-page-skeleton";

export default function CounselingLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader
        title="Counseling"
        description={<Skeleton as="span" className="h-4 w-28" />}
        actions={<Skeleton className="h-9 w-32" />}
      />
      <ListPanelSkeleton columns={5} filters={3} />
    </div>
  );
}

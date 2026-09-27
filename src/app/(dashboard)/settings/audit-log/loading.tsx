import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ListPanelSkeleton } from "@/components/ui/list-page-skeleton";

export default function AuditLogLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader title="Audit log" description="Every create, update, and report generation event." />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-20 rounded-md" />
        ))}
      </div>
      <ListPanelSkeleton columns={4} filters={1} />
    </div>
  );
}

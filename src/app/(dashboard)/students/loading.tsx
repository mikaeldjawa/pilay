import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ListPanelSkeleton } from "@/components/ui/list-page-skeleton";

export default function StudentsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader
        title="Students"
        description={<Skeleton as="span" className="h-4 w-32" />}
        actions={
          <>
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
          </>
        }
      />
      <ListPanelSkeleton columns={4} filters={3} />
    </div>
  );
}

import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListPanelSkeleton } from "@/components/ui/list-page-skeleton";
import { FormFieldsSkeleton } from "@/components/ui/form-page-skeleton";

export default function JournalLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader title="Journal" description={<Skeleton as="span" className="h-4 w-56" />} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-[18px] shadow-soft-sm"
          >
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="mt-2 h-7 w-12" />
            <Skeleton className="mt-2 h-3 w-20" />
          </div>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">New entry</CardTitle>
        </CardHeader>
        <CardContent>
          <FormFieldsSkeleton fields={4} />
        </CardContent>
      </Card>
      <ListPanelSkeleton columns={5} filters={1} />
    </div>
  );
}

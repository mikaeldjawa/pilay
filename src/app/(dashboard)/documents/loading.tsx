import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListPanelSkeleton } from "@/components/ui/list-page-skeleton";

export default function DocumentsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader
        title="Documents"
        description="Document Vault — generated reports and uploaded files, all in one place."
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload a document</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
      <ListPanelSkeleton columns={4} filters={2} />
    </div>
  );
}

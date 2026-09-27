import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ImportStudentsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader
        title="Import students"
        description="Bulk-create students from an .xlsx roster. Columns: Student ID, Name, Class, Gender, Academic Year. The file is also saved to the Document Vault."
      />
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Upload roster</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

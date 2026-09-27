import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StudentImportForm } from "@/components/students/student-import-form";

export default function ImportStudentsPage() {
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
          <StudentImportForm />
        </CardContent>
      </Card>
    </div>
  );
}

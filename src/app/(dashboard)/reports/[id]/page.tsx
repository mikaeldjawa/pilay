import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { REPORT_STATUS_VARIANT } from "@/lib/status-colors";
import { formatStudentName } from "@/lib/utils";
import { findGeneratedReportById } from "@/modules/reports/report.repository";

export default async function ReportDetailPage(props: PageProps<"/reports/[id]">) {
  const { id } = await props.params;
  const report = await findGeneratedReportById(id);
  if (!report) notFound();

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader
        title={report.documentTitle ?? report.reportNumber}
        titleBadges={<Badge variant={REPORT_STATUS_VARIANT[report.status]}>{report.status}</Badge>}
        description={
          <>
            {report.reportNumber} — {report.reportType.replaceAll("_", " ")}
            {report.student ? ` — ${formatStudentName(report.student)}` : ""}
          </>
        }
      />

      {report.status === "READY" ? (
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-base">Document</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <iframe
              src={`/api/reports/${report.id}/pdf`}
              className="h-[80vh] w-full rounded-md border"
              title={report.documentTitle ?? report.reportNumber}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            {report.status === "GENERATING" ? "Report is still generating." : "Report generation failed."}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

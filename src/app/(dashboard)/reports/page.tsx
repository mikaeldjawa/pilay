import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { TablePanel, TablePanelFooter } from "@/components/ui/table-panel";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  listGeneratedReports,
  type ReportSortKey,
} from "@/modules/reports/report.repository";
import type { ReportStatus, ReportType } from "@/generated/prisma/client";
import { REPORT_STATUS_VARIANT } from "@/lib/status-colors";
import { AlertTriangle, ClipboardList, FileText, Plus, User } from "lucide-react";
import Link from "next/link";

const TILES = [
  {
    href: "/reports/new?type=COUNSELING_CASE",
    icon: FileText,
    title: "Case/Incident Counseling Report",
    description:
      "Confidential report generated from an escalated counseling session.",
  },
  {
    href: "/reports/new?type=INCIDENT_MAJOR",
    icon: AlertTriangle,
    title: "Major Incident Report",
    description: "Mirrors the Incident Logbook Section B.",
  },
  {
    href: "/reports/new?type=BEHAVIOR_LOG_MINOR",
    icon: ClipboardList,
    title: "Minor Behavior Log",
    description: "Filtered, dated export of the tick-and-go grid.",
  },
  {
    href: "/reports/new?type=STUDENT_SUMMARY",
    icon: User,
    title: "Student Full Report",
    description: "Merges every counseling case, major incident, and minor behavior log for one student into a single document.",
  },
];

const REPORT_TYPE_OPTIONS: ReportType[] = [
  "COUNSELING_CASE",
  "INCIDENT_MAJOR",
  "BEHAVIOR_LOG_MINOR",
  "STUDENT_SUMMARY",
  "BEHAVIOR_SUMMARY",
  "SEMESTER_SUMMARY",
  "CUSTOM",
];
const REPORT_STATUS_OPTIONS: ReportStatus[] = ["GENERATING", "READY", "FAILED", "ARCHIVED"];
const SORT_KEYS: ReportSortKey[] = ["date", "number"];

const PATHNAME = "/reports";
const PAGE_SIZE = 25;

export default async function ReportsPage(props: PageProps<"/reports">) {
  const searchParams = await props.searchParams;
  const search = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const reportType =
    typeof searchParams.reportType === "string" && REPORT_TYPE_OPTIONS.includes(searchParams.reportType as ReportType)
      ? (searchParams.reportType as ReportType)
      : undefined;
  const status =
    typeof searchParams.status === "string" && REPORT_STATUS_OPTIONS.includes(searchParams.status as ReportStatus)
      ? (searchParams.status as ReportStatus)
      : undefined;
  const sort =
    typeof searchParams.sort === "string" && SORT_KEYS.includes(searchParams.sort as ReportSortKey)
      ? (searchParams.sort as ReportSortKey)
      : undefined;
  const dir = searchParams.dir === "asc" ? "asc" : "desc";
  const page = typeof searchParams.page === "string" ? Math.max(1, parseInt(searchParams.page, 10) || 1) : 1;

  const { reports, total } = await listGeneratedReports({
    search,
    reportType,
    status,
    sort,
    dir,
    page,
    pageSize: PAGE_SIZE,
  });

  const typeItems = [
    { value: "all", label: "All types" },
    ...REPORT_TYPE_OPTIONS.map((t) => ({ value: t, label: t.replaceAll("_", " ") })),
  ];
  const statusItems = [
    { value: "all", label: "All statuses" },
    ...REPORT_STATUS_OPTIONS.map((s) => ({ value: s, label: s })),
  ];

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <PageHeader title='Reports' description='Generate and review official reports.' />

      <div className='grid grid-cols-3 gap-4'>
        {TILES.map((tile) => (
          <Card key={tile.href}>
            <CardHeader>
              <tile.icon className='size-5 text-muted-foreground' />
              <CardTitle className='text-base'>{tile.title}</CardTitle>
              <CardDescription>{tile.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                render={<Link href={tile.href} />}
                nativeButton={false}
                size='sm'
              >
                <Plus />
                Generate
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <TablePanel
        toolbar={
          <form className='flex flex-wrap items-center gap-2'>
        <Input
          name='q'
          className='max-w-sm'
          placeholder='Search by report #, title, or student...'
          defaultValue={search}
        />
        <Select name='reportType' defaultValue={reportType ?? "all"} items={typeItems}>
          <SelectTrigger className='w-44'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {typeItems.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select name='status' defaultValue={status ?? "all"} items={statusItems}>
          <SelectTrigger className='w-44'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusItems.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {sort ? <input type='hidden' name='sort' value={sort} /> : null}
        {dir ? <input type='hidden' name='dir' value={dir} /> : null}
        <Button type='submit' variant='outline'>
          Filter
        </Button>
        <Button variant='ghost' render={<Link href={PATHNAME} />} nativeButton={false}>
          Clear
        </Button>
          </form>
        }
      >

      <Table>
        <TableHeader>
          <TableRow>
            <SortableTableHead
              label='Report #'
              sortKey='number'
              currentSort={sort}
              currentDir={dir}
              pathname={PATHNAME}
              searchParams={searchParams}
            />
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <SortableTableHead
              label='Generated'
              sortKey='date'
              currentSort={sort}
              currentDir={dir}
              pathname={PATHNAME}
              searchParams={searchParams}
            />
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>
                <EmptyState
                  illustration='quiet'
                  title='No reports yet'
                  description='Generate a report and it will appear here, ready to download.'
                />
              </TableCell>
            </TableRow>
          ) : (
            reports.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <Link
                    href={`/reports/${r.id}`}
                    className='font-medium hover:underline'
                  >
                    {r.reportNumber}
                  </Link>
                </TableCell>
                <TableCell>{r.documentTitle}</TableCell>
                <TableCell>{r.reportType.replaceAll("_", " ")}</TableCell>
                <TableCell className='tabular-nums'>
                  {r.generatedAt ? r.generatedAt.toLocaleString() : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={REPORT_STATUS_VARIANT[r.status]}>
                    {r.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

        <TablePanelFooter>
          <DataTablePagination
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            pathname={PATHNAME}
            searchParams={searchParams}
          />
        </TablePanelFooter>
      </TablePanel>
    </div>
  );
}

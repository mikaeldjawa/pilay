import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listFollowUps, type FollowUpSortKey } from "@/modules/follow-ups/follow-up.repository";
import { CompleteFollowUpButton } from "@/components/follow-ups/complete-follow-up-button";
import { FollowUpCreateForm } from "@/components/follow-ups/follow-up-create-form";
import { listStudentOptions } from "@/modules/students/student.repository";
import type { FollowUpPriority, FollowUpStatus } from "@/generated/prisma/client";
import { FOLLOWUP_WORKFLOW_VARIANT, PRIORITY_STATUS } from "@/lib/status-colors";
import { formatStudentName } from "@/lib/utils";

const PRIORITY_OPTIONS: FollowUpPriority[] = ["LOW", "NORMAL", "HIGH", "CRITICAL"];
const STATUS_OPTIONS: FollowUpStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
const SORT_KEYS: FollowUpSortKey[] = ["due", "priority", "status"];

const PATHNAME = "/follow-ups";
const PAGE_SIZE = 25;

function dueBucket(dueDate: Date, status: string) {
  if (status === "COMPLETED" || status === "CANCELLED") return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  if (due < today) return "Overdue";
  if (due.getTime() === today.getTime()) return "Due today";
  return null;
}

export default async function FollowUpsPage(props: PageProps<"/follow-ups">) {
  const searchParams = await props.searchParams;
  const defaultStudentId = typeof searchParams.studentId === "string" ? searchParams.studentId : undefined;
  const search = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const status =
    typeof searchParams.status === "string" && STATUS_OPTIONS.includes(searchParams.status as FollowUpStatus)
      ? (searchParams.status as FollowUpStatus)
      : undefined;
  const priority =
    typeof searchParams.priority === "string" && PRIORITY_OPTIONS.includes(searchParams.priority as FollowUpPriority)
      ? (searchParams.priority as FollowUpPriority)
      : undefined;
  const sort =
    typeof searchParams.sort === "string" && SORT_KEYS.includes(searchParams.sort as FollowUpSortKey)
      ? (searchParams.sort as FollowUpSortKey)
      : undefined;
  const dir = searchParams.dir === "desc" ? "desc" : "asc";
  const page = typeof searchParams.page === "string" ? Math.max(1, parseInt(searchParams.page, 10) || 1) : 1;

  const [{ followUps, total }, students] = await Promise.all([
    listFollowUps({ search, status, priority, sort, dir, page, pageSize: PAGE_SIZE }),
    listStudentOptions(),
  ]);

  const statusItems = [{ value: "all", label: "All statuses" }, ...STATUS_OPTIONS.map((s) => ({ value: s, label: s.replaceAll("_", " ") }))];
  const priorityItems = [{ value: "all", label: "All priorities" }, ...PRIORITY_OPTIONS.map((p) => ({ value: p, label: p }))];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader title="Follow-ups" description={`${total} item(s) tracked`} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add follow-up</CardTitle>
        </CardHeader>
        <CardContent>
          <FollowUpCreateForm
            students={students.map((s) => ({ id: s.id, label: formatStudentName(s) }))}
            defaultStudentId={defaultStudentId}
          />
        </CardContent>
      </Card>

      <TablePanel
        toolbar={
          <form className="flex flex-wrap items-center gap-2">
        <Input
          name="q"
          className="max-w-sm"
          placeholder="Search by title or student name..."
          defaultValue={search}
        />
        <Select name="status" defaultValue={status ?? "all"} items={statusItems}>
          <SelectTrigger className="w-44">
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
        <Select name="priority" defaultValue={priority ?? "all"} items={priorityItems}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {priorityItems.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {sort ? <input type="hidden" name="sort" value={sort} /> : null}
        {dir ? <input type="hidden" name="dir" value={dir} /> : null}
        <Button type="submit" variant="outline">
          Filter
        </Button>
        <Button variant="ghost" render={<Link href={PATHNAME} />} nativeButton={false}>
          Clear
        </Button>
          </form>
        }
      >

      <Table>
        <TableHeader>
          <TableRow>
            <SortableTableHead
              label="Due"
              sortKey="due"
              currentSort={sort}
              currentDir={dir}
              pathname={PATHNAME}
              searchParams={searchParams}
            />
            <TableHead>Student</TableHead>
            <TableHead>Title</TableHead>
            <SortableTableHead
              label="Priority"
              sortKey="priority"
              currentSort={sort}
              currentDir={dir}
              pathname={PATHNAME}
              searchParams={searchParams}
            />
            <SortableTableHead
              label="Status"
              sortKey="status"
              currentSort={sort}
              currentDir={dir}
              pathname={PATHNAME}
              searchParams={searchParams}
            />
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {followUps.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>
                <EmptyState
                  illustration="silly"
                  title="Nothing to chase"
                  description="You're all caught up — no follow-ups are waiting. Go take a breather."
                />
              </TableCell>
            </TableRow>
          ) : (
            followUps.map((f) => {
              const bucket = dueBucket(f.dueDate, f.status);
              return (
                <TableRow key={f.id}>
                  <TableCell className="tabular-nums">
                    {f.dueDate.toLocaleDateString()}
                    {bucket ? (
                      <StatusBadge
                        level={bucket === "Overdue" ? "critical" : "warning"}
                        label={bucket}
                        className="ml-2"
                      />
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Link href={`/students/${f.student.id}`} className="hover:underline">
                      {formatStudentName(f.student)}
                    </Link>
                  </TableCell>
                  <TableCell>{f.title}</TableCell>
                  <TableCell>
                    <StatusBadge level={PRIORITY_STATUS[f.priority]} label={f.priority} />
                  </TableCell>
                  <TableCell>
                    <Badge variant={FOLLOWUP_WORKFLOW_VARIANT[f.status]}>{f.status.replaceAll("_", " ")}</Badge>
                  </TableCell>
                  <TableCell>
                    {f.status !== "COMPLETED" && f.status !== "CANCELLED" ? (
                      <CompleteFollowUpButton id={f.id} />
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })
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

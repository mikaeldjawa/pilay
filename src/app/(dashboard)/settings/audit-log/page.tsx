import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listAuditLog, listAuditLogEntityTypes } from "@/modules/audit/audit.service";
import type { AuditAction } from "@/generated/prisma/client";
import Link from "next/link";

const ACTION_OPTIONS: AuditAction[] = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "ARCHIVE",
  "RESTORE",
  "VIEW",
  "DOWNLOAD",
  "GENERATE_REPORT",
];

const PATHNAME = "/settings/audit-log";
const PAGE_SIZE = 25;

export default async function AuditLogPage(props: PageProps<"/settings/audit-log">) {
  const searchParams = await props.searchParams;
  const entityType = typeof searchParams.entityType === "string" ? searchParams.entityType : undefined;
  const action =
    typeof searchParams.action === "string" && ACTION_OPTIONS.includes(searchParams.action as AuditAction)
      ? (searchParams.action as AuditAction)
      : undefined;
  const dir = searchParams.dir === "asc" ? "asc" : "desc";
  const page = typeof searchParams.page === "string" ? Math.max(1, parseInt(searchParams.page, 10) || 1) : 1;

  const [{ logs, total }, entityTypes] = await Promise.all([
    listAuditLog({ entityType, action, dir, page, pageSize: PAGE_SIZE }),
    listAuditLogEntityTypes(),
  ]);

  const actionItems = [{ value: "all", label: "All actions" }, ...ACTION_OPTIONS.map((a) => ({ value: a, label: a.replaceAll("_", " ") }))];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader title="Audit log" description="Every create, update, and report generation event." />

      <nav className="flex flex-wrap gap-1 text-sm">
        <a
          href={PATHNAME}
          className={`rounded-md px-2 py-1 ${!entityType ? "bg-muted font-medium" : "text-muted-foreground"}`}
        >
          All
        </a>
        {entityTypes.map((e) => (
          <a
            key={e}
            href={`${PATHNAME}?entityType=${e}`}
            className={`rounded-md px-2 py-1 ${entityType === e ? "bg-muted font-medium" : "text-muted-foreground"}`}
          >
            {e.replaceAll("_", " ")}
          </a>
        ))}
      </nav>

      <TablePanel
        toolbar={
          <form className="flex flex-wrap items-center gap-2">
        {entityType ? <input type="hidden" name="entityType" value={entityType} /> : null}
        <Select name="action" defaultValue={action ?? "all"} items={actionItems}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {actionItems.map((a) => (
              <SelectItem key={a.value} value={a.value}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {dir ? <input type="hidden" name="dir" value={dir} /> : null}
        <Button type="submit" variant="outline">
          Filter
        </Button>
        <Button
          variant="ghost"
          render={<Link href={entityType ? `${PATHNAME}?entityType=${entityType}` : PATHNAME} />}
          nativeButton={false}
        >
          Clear
        </Button>
          </form>
        }
      >

      <Table>
        <TableHeader>
          <TableRow>
            <SortableTableHead
              label="When"
              sortKey="date"
              currentSort="date"
              currentDir={dir}
              pathname={PATHNAME}
              searchParams={searchParams}
            />
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>
                <EmptyState
                  illustration="privacy"
                  title="Nothing logged yet"
                  description="Every create, update, and report event will be recorded here."
                />
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="tabular-nums">{log.createdAt.toLocaleString()}</TableCell>
                <TableCell>{log.user?.fullName ?? "System"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{log.action}</Badge>
                </TableCell>
                <TableCell>
                  {log.entityType.replaceAll("_", " ")}
                  {log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}
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

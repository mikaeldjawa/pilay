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
import {
  listCounselingCategories,
  listCounselingSessions,
  type CounselingSortKey,
} from "@/modules/counseling/counseling.repository";
import type { RiskLevel, SessionStatus } from "@/generated/prisma/client";
import { RISK_STATUS, SESSION_STATUS_VARIANT } from "@/lib/status-colors";
import { formatStudentName } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";

const RISK_OPTIONS: RiskLevel[] = ["LOW", "MODERATE", "HIGH", "CRITICAL"];
const STATUS_OPTIONS: SessionStatus[] = ["OPEN", "FOLLOW_UP", "COMPLETED", "CLOSED"];
const SORT_KEYS: CounselingSortKey[] = ["date", "risk", "status"];

const PATHNAME = "/counseling";
const PAGE_SIZE = 25;

export default async function CounselingPage(props: PageProps<"/counseling">) {
  const searchParams = await props.searchParams;
  const search = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const categoryId =
    typeof searchParams.categoryId === "string" && searchParams.categoryId !== "all"
      ? searchParams.categoryId
      : undefined;
  const riskLevel =
    typeof searchParams.riskLevel === "string" && RISK_OPTIONS.includes(searchParams.riskLevel as RiskLevel)
      ? (searchParams.riskLevel as RiskLevel)
      : undefined;
  const status =
    typeof searchParams.status === "string" && STATUS_OPTIONS.includes(searchParams.status as SessionStatus)
      ? (searchParams.status as SessionStatus)
      : undefined;
  const sort =
    typeof searchParams.sort === "string" && SORT_KEYS.includes(searchParams.sort as CounselingSortKey)
      ? (searchParams.sort as CounselingSortKey)
      : undefined;
  const dir = searchParams.dir === "asc" ? "asc" : "desc";
  const page = typeof searchParams.page === "string" ? Math.max(1, parseInt(searchParams.page, 10) || 1) : 1;

  const [{ sessions, total }, categories] = await Promise.all([
    listCounselingSessions({ search, categoryId, riskLevel, status, sort, dir, page, pageSize: PAGE_SIZE }),
    listCounselingCategories(),
  ]);

  const categoryItems = [
    { value: "all", label: "All categories" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];
  const riskItems = [{ value: "all", label: "All risk levels" }, ...RISK_OPTIONS.map((r) => ({ value: r, label: r }))];
  const statusItems = [{ value: "all", label: "All statuses" }, ...STATUS_OPTIONS.map((s) => ({ value: s, label: s }))];

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <PageHeader
        title='Counseling'
        description={`${total} session(s)`}
        actions={
          <Button render={<Link href='/counseling/new' />} nativeButton={false}>
            <Plus />
            New session
          </Button>
        }
      />

      <TablePanel
        toolbar={
          <form className='flex flex-wrap items-center gap-2'>
        <Input
          name='q'
          className='max-w-sm'
          placeholder='Search by student name...'
          defaultValue={search}
        />
        <Select name='categoryId' defaultValue={categoryId ?? "all"} items={categoryItems}>
          <SelectTrigger className='w-44'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryItems.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select name='riskLevel' defaultValue={riskLevel ?? "all"} items={riskItems}>
          <SelectTrigger className='w-44'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {riskItems.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
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
              label='Date'
              sortKey='date'
              currentSort={sort}
              currentDir={dir}
              pathname={PATHNAME}
              searchParams={searchParams}
            />
            <TableHead>Attending student</TableHead>
            <TableHead>Category</TableHead>
            <SortableTableHead
              label='Risk'
              sortKey='risk'
              currentSort={sort}
              currentDir={dir}
              pathname={PATHNAME}
              searchParams={searchParams}
            />
            <SortableTableHead
              label='Status'
              sortKey='status'
              currentSort={sort}
              currentDir={dir}
              pathname={PATHNAME}
              searchParams={searchParams}
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>
                <EmptyState
                  illustration='make-peace'
                  title='No sessions logged yet'
                  description='Every session you record builds the student’s support story.'
                />
              </TableCell>
            </TableRow>
          ) : (
            sessions.map((s) => (
              <TableRow key={s.id}>
                <TableCell className='tabular-nums'>{s.sessionDate.toLocaleDateString()}</TableCell>
                <TableCell>
                  <Link
                    href={`/counseling/${s.id}`}
                    className='font-medium hover:underline'
                  >
                    {formatStudentName(s.student)}
                  </Link>
                  {s.subjectStudent ? (
                    <p className='text-xs text-muted-foreground'>
                      Subject: {formatStudentName(s.subjectStudent)}
                    </p>
                  ) : null}
                </TableCell>
                <TableCell>{s.counselingCategory.name}</TableCell>
                <TableCell>
                  <StatusBadge level={RISK_STATUS[s.riskLevel]} label={s.riskLevel} />
                </TableCell>
                <TableCell>
                  <Badge variant={SESSION_STATUS_VARIANT[s.status]}>{s.status}</Badge>
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

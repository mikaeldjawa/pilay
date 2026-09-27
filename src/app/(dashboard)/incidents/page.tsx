import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { TablePanel, TablePanelFooter } from "@/components/ui/table-panel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import type { IncidentStatus } from "@/generated/prisma/client";
import { CHRONIC_THRESHOLD, CHRONIC_WINDOW_DAYS } from "@/lib/constants";
import { buildHref, type SearchParams } from "@/lib/query-string";
import { cn } from "@/lib/utils";
import {
  INCIDENT_SEVERITY_STATUS,
  INCIDENT_WORKFLOW_VARIANT,
} from "@/lib/status-colors";
import {
  listIncidentCategories,
  listIncidentFeed,
  type IncidentFeedRow,
  type IncidentSortKey,
} from "@/modules/incidents/incident.repository";
import { ClipboardList, Plus } from "lucide-react";
import Link from "next/link";

// Cross-row student flags get a severity-ranked highlight — major-incident
// history outranks a chronic minor pattern when a row has both, so the tint
// always reflects the more serious signal.
function rowHighlightClass(row: IncidentFeedRow): string | undefined {
  if (row.hasMajorIncidentHistory) {
    return "bg-destructive/5 hover:bg-destructive/10 dark:bg-destructive/10";
  }
  if (row.isChronicMinor) {
    return "bg-status-warning/5 hover:bg-status-warning/10 dark:bg-status-warning/10";
  }
  return undefined;
}

const TYPE_TABS = [
  { value: "all", label: "All" },
  { value: "major_incident", label: "Major" },
  { value: "minor_incident", label: "Minor" },
];

// Plain navigation links styled to match the app's Tabs component, rather
// than the interactive Tabs primitive itself — the primitive is a "use
// client" component whose internal state (and even its cva class-builder
// export) can't be called from this server component, and this page's
// "selected tab" is really just the incidentType search param driving a
// server-rendered query anyway, so a real tab switch has to be a full
// navigation, not a client toggle.
function IncidentTypeTabs({
  pathname,
  searchParams,
  active,
}: {
  pathname: string;
  searchParams: SearchParams;
  active: string;
}) {
  return (
    <div className='inline-flex h-8 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground'>
      {TYPE_TABS.map((tab) => {
        const isActive = tab.value === active;
        return (
          <Link
            key={tab.value}
            href={buildHref(pathname, searchParams, {
              incidentType: tab.value === "all" ? undefined : tab.value,
              page: undefined,
            })}
            className={cn(
              "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-3 py-0.5 text-sm font-medium whitespace-nowrap transition-all",
              isActive
                ? "bg-background text-foreground shadow-sm dark:border-input dark:bg-input/30"
                : "text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

const STATUS_OPTIONS: IncidentStatus[] = [
  "NEW",
  "UNDER_INVESTIGATION",
  "SUPPORT_PLAN_ACTIVE",
  "MONITORING",
  "RESOLVED",
  "CLOSED",
];
const SORT_KEYS: IncidentSortKey[] = ["date", "status", "number"];

const PATHNAME = "/incidents";
const PAGE_SIZE = 25;

export default async function IncidentsPage(props: PageProps<"/incidents">) {
  const searchParams = await props.searchParams;
  const search =
    typeof searchParams.q === "string" ? searchParams.q : undefined;
  const rawIncidentType =
    typeof searchParams.incidentType === "string"
      ? searchParams.incidentType
      : "all";
  const incidentType: "major" | "minor" | undefined =
    rawIncidentType === "major_incident"
      ? "major"
      : rawIncidentType === "minor_incident"
        ? "minor"
        : undefined;
  const categoryId =
    typeof searchParams.categoryId === "string" &&
    searchParams.categoryId !== "all"
      ? searchParams.categoryId
      : undefined;
  const status =
    typeof searchParams.status === "string" &&
    STATUS_OPTIONS.includes(searchParams.status as IncidentStatus)
      ? (searchParams.status as IncidentStatus)
      : undefined;
  const sort =
    typeof searchParams.sort === "string" &&
    SORT_KEYS.includes(searchParams.sort as IncidentSortKey)
      ? (searchParams.sort as IncidentSortKey)
      : undefined;
  const dir = searchParams.dir === "asc" ? "asc" : "desc";
  const page =
    typeof searchParams.page === "string"
      ? Math.max(1, parseInt(searchParams.page, 10) || 1)
      : 1;

  const [{ rows, total }, categories] = await Promise.all([
    listIncidentFeed({
      search,
      incidentType,
      categoryId,
      status,
      sort,
      dir,
      page,
      pageSize: PAGE_SIZE,
    }),
    listIncidentCategories(),
  ]);

  const typeLabel =
    incidentType === "major"
      ? "major incident"
      : incidentType === "minor"
        ? "minor behavior log"
        : "incident/behavior log";
  const emptyLabel =
    incidentType === "major"
      ? "No major incidents logged yet."
      : incidentType === "minor"
        ? "No minor behavior logs recorded yet."
        : "No incidents or behavior logs recorded yet.";
  const isMajorOnly = incidentType === "major";

  const categoryItems = [
    { value: "all", label: "All categories" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];
  const statusItems = [
    { value: "all", label: "All statuses" },
    ...STATUS_OPTIONS.map((s) => ({ value: s, label: s.replaceAll("_", " ") })),
  ];

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <PageHeader
        title='Incidents'
        description={`${total} ${typeLabel}(s)`}
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button />}>
              <Plus />
              New
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem render={<Link href='/incidents/major/new' />}>
                Major incident report
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href='/incidents/minor/new' />}>
                <ClipboardList />
                Log minor behavior
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <IncidentTypeTabs
        pathname={PATHNAME}
        searchParams={searchParams}
        active={rawIncidentType}
      />

      <TablePanel
        toolbar={
          <form className='flex flex-wrap items-center gap-2'>
        <Input
          name='q'
          className='max-w-sm'
          placeholder='Search by incident # or student name...'
          defaultValue={search}
        />
        {rawIncidentType !== "all" ? (
          <input type='hidden' name='incidentType' value={rawIncidentType} />
        ) : null}
        {rawIncidentType !== "minor_incident" ? (
          <>
            <Select
              name='categoryId'
              defaultValue={categoryId ?? "all"}
              items={categoryItems}
            >
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
            <Select
              name='status'
              defaultValue={status ?? "all"}
              items={statusItems}
            >
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
          </>
        ) : null}
        {sort ? <input type='hidden' name='sort' value={sort} /> : null}
        {dir ? <input type='hidden' name='dir' value={dir} /> : null}
        <Button type='submit' variant='outline'>
          Filter
        </Button>
        <Button
          variant='ghost'
          render={<Link href={PATHNAME} />}
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
            <TableHead>Type</TableHead>
            {isMajorOnly ? (
              <SortableTableHead
                label='Incident #'
                sortKey='number'
                currentSort={sort}
                currentDir={dir}
                pathname={PATHNAME}
                searchParams={searchParams}
              />
            ) : (
              <TableHead>Incident #</TableHead>
            )}
            <SortableTableHead
              label='Date'
              sortKey='date'
              currentSort={sort}
              currentDir={dir}
              pathname={PATHNAME}
              searchParams={searchParams}
            />
            <TableHead>Student</TableHead>
            <TableHead>Category</TableHead>
            {isMajorOnly ? (
              <SortableTableHead
                label='Status'
                sortKey='status'
                currentSort={sort}
                currentDir={dir}
                pathname={PATHNAME}
                searchParams={searchParams}
              />
            ) : (
              <TableHead>Status</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>
                <EmptyState
                  illustration='top-user'
                  title='All calm here'
                  description={emptyLabel}
                />
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={`${row.kind}-${row.id}`}
                className={cn(rowHighlightClass(row))}
              >
                <TableCell>
                  <StatusBadge
                    level={INCIDENT_SEVERITY_STATUS[row.kind === "major" ? "MAJOR" : "MINOR"]}
                    label={row.kind === "major" ? "Major" : "Minor"}
                  />
                </TableCell>
                <TableCell>
                  {row.number ? (
                    <Link
                      href={row.href}
                      className='font-medium hover:underline'
                    >
                      {row.number}
                    </Link>
                  ) : (
                    <span className='text-muted-foreground'>—</span>
                  )}
                </TableCell>
                <TableCell className='tabular-nums'>
                  {row.date.toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className='flex flex-wrap items-center gap-1.5'>
                    <Link href={row.href} className='hover:underline'>
                      {row.studentName}
                    </Link>
                    {row.hasMajorIncidentHistory && row.kind !== "major" ? (
                      <span title='This student already has a major incident on record.'>
                        <StatusBadge level='critical' label='Major hx' />
                      </span>
                    ) : null}
                    {row.isChronicMinor ? (
                      <span
                        title={`${CHRONIC_THRESHOLD}+ occurrences of the same minor behavior code within the last ${CHRONIC_WINDOW_DAYS} days.`}
                      >
                        <StatusBadge level='warning' label='Chronic' />
                      </span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>
                  {row.status ? (
                    <Badge variant={INCIDENT_WORKFLOW_VARIANT[row.status]}>
                      {row.status.replaceAll("_", " ")}
                    </Badge>
                  ) : (
                    <span className='text-muted-foreground'>—</span>
                  )}
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

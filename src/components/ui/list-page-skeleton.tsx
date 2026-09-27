import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Reuses the real Table/TableRow/etc. structure — only cell *content* is a
// skeleton placeholder — so column widths/borders/spacing match the real
// table exactly instead of approximating it with generic bars.
export function TableSkeleton({
  columns,
  rows = 8,
}: {
  columns: number;
  rows?: number;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {Array.from({ length: columns }).map((_, i) => (
            <TableHead key={i}>
              <Skeleton className="h-4 w-16" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, r) => (
          <TableRow key={r}>
            {Array.from({ length: columns }).map((_, c) => (
              <TableCell key={c}>
                <Skeleton className="h-4 w-full max-w-32" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// The loading counterpart to TablePanel — a filter toolbar, table, and
// pagination footer inside the same rounded card, so the skeleton and the
// loaded page share one silhouette and nothing jumps on hydration.
export function ListPanelSkeleton({
  columns,
  filters = 3,
  rows = 8,
}: {
  columns: number;
  filters?: number;
  rows?: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-soft-sm">
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
        <Skeleton className="h-9 w-64" />
        {Array.from({ length: filters }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-44" />
        ))}
        <Skeleton className="h-9 w-16" />
      </div>
      <TableSkeleton columns={columns} rows={rows} />
      <div className="flex items-center justify-between border-t px-4 py-3">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}

export function FilterBarSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-wrap items-end gap-2">
      <Skeleton className="h-9 w-64" />
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-44" />
      ))}
      <Skeleton className="h-9 w-16" />
    </div>
  );
}

export function PaginationBarSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-32" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

export function TabsBarSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="inline-flex h-8 w-fit items-center gap-1 rounded-lg bg-muted p-[3px]">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-full w-16 rounded-md" />
      ))}
    </div>
  );
}

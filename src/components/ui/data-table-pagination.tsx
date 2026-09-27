import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { buildHref, type SearchParams } from "@/lib/query-string";

export function DataTablePagination({
  page,
  pageSize,
  total,
  pathname,
  searchParams,
}: {
  page: number;
  pageSize: number;
  total: number;
  pathname: string;
  searchParams: SearchParams;
}) {
  if (total === 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const hrefFor = (p: number) => buildHref(pathname, searchParams, { page: p === 1 ? undefined : String(p) });

  const windowStart = Math.max(1, Math.min(page - 2, totalPages - 4));
  const windowEnd = Math.min(totalPages, Math.max(page + 2, 5));
  const pageNumbers: number[] = [];
  for (let p = windowStart; p <= windowEnd; p++) pageNumbers.push(p);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {from}–{to} of {total}
      </p>
      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={page > 1 ? hrefFor(page - 1) : undefined}
              className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
            />
          </PaginationItem>
          {windowStart > 1 ? (
            <>
              <PaginationItem>
                <PaginationLink href={hrefFor(1)}>1</PaginationLink>
              </PaginationItem>
              {windowStart > 2 ? (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : null}
            </>
          ) : null}
          {pageNumbers.map((p) => (
            <PaginationItem key={p}>
              <PaginationLink href={hrefFor(p)} isActive={p === page}>
                {p}
              </PaginationLink>
            </PaginationItem>
          ))}
          {windowEnd < totalPages ? (
            <>
              {windowEnd < totalPages - 1 ? (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : null}
              <PaginationItem>
                <PaginationLink href={hrefFor(totalPages)}>{totalPages}</PaginationLink>
              </PaginationItem>
            </>
          ) : null}
          <PaginationItem>
            <PaginationNext
              href={page < totalPages ? hrefFor(page + 1) : undefined}
              className={page >= totalPages ? "pointer-events-none opacity-50" : undefined}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

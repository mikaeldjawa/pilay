import Link from "next/link";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { buildHref, type SearchParams } from "@/lib/query-string";

export function SortableTableHead({
  label,
  sortKey,
  currentSort,
  currentDir,
  pathname,
  searchParams,
  className,
}: {
  label: string;
  sortKey: string;
  currentSort?: string;
  currentDir?: string;
  pathname: string;
  searchParams: SearchParams;
  className?: string;
}) {
  const isActive = currentSort === sortKey;
  const nextDir = isActive && currentDir === "asc" ? "desc" : "asc";
  const href = buildHref(pathname, searchParams, {
    sort: sortKey,
    dir: nextDir,
    page: undefined,
  });
  const Icon = isActive ? (currentDir === "asc" ? ChevronUp : ChevronDown) : ChevronsUpDown;

  return (
    <TableHead className={className}>
      <Link href={href} className="inline-flex items-center gap-1 hover:text-foreground">
        {label}
        <Icon className={`size-3.5 ${isActive ? "" : "text-muted-foreground"}`} />
      </Link>
    </TableHead>
  );
}

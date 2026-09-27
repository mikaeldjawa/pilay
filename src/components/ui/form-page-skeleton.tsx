import { Skeleton } from "@/components/ui/skeleton";

// Approximates a Field (label + input) — used across create/edit form pages
// where the real form's field count/labels aren't worth mirroring exactly
// for a loading state that's on screen for a fraction of a second.
export function FormFieldsSkeleton({
  fields = 6,
  columns = 1,
}: {
  fields?: number;
  columns?: 1 | 2;
}) {
  return (
    <div className={columns === 2 ? "grid grid-cols-2 gap-4" : "flex flex-col gap-4"}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
  );
}

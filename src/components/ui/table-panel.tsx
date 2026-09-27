import { cn } from "@/lib/utils";

// The standard list surface for the app: a soft rounded card that holds a
// filter toolbar, a table, and a pagination footer as one panel. Mirrors the
// `.panel` / `.panel-head` recipe in docs/Design System Preview.md so every
// list page reads as the same component, not seven bespoke layouts.
export function TablePanel({
  toolbar,
  children,
  className,
}: {
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card shadow-soft-sm",
        className,
      )}
    >
      {toolbar ? (
        <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
          {toolbar}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function TablePanelFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-t px-4 py-3", className)}>{children}</div>
  );
}

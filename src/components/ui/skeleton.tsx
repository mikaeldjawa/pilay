import { cn } from "@/lib/utils"

// Defaults to a <div>, but accepts `as="span"` for placeholders used inside
// phrasing-content-only parents (e.g. a <p>/<h1>, like PageHeader's
// title/description slots) — a nested <div> there is invalid HTML and
// triggers a hydration mismatch.
function Skeleton({
  className,
  as: Tag = "div",
  ...props
}: React.ComponentProps<"div"> & { as?: "div" | "span" }) {
  return (
    <Tag
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-muted", Tag === "span" && "inline-block", className)}
      {...props}
    />
  )
}

export { Skeleton }

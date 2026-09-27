import { cn } from "@/lib/utils";

// A warm, illustrated empty state. The illustration sits in a soft tinted
// disc so the line-art reads on any surface, paired with a specific,
// human title/description and an optional call to action. Illustrations live
// in /public/illustrations (see docs — friendly counseling-themed set).
export function EmptyState({
  illustration,
  title,
  description,
  action,
  className,
}: {
  illustration:
    | "make-peace"
    | "siblings"
    | "top-user"
    | "privacy"
    | "quiet"
    | "silly";
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex max-w-sm flex-col items-center gap-1 py-10 text-center",
        className,
      )}
    >
      {/* Fixed light disc in both themes — the line-art illustrations are dark
          strokes on transparent, so they need a consistently light backing to
          read (the same reason the login frame stays white on the blue panel). */}
      <div className='mb-3 grid size-36 place-items-center rounded-full bg-[#FEFEFE] ring-1 ring-[#DCE2FF] overflow-hidden'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/illustrations/${illustration}.svg`}
          alt=''
          width={400}
          height={400}
          className='size-28'
        />
      </div>
      <p className='text-base font-bold text-foreground'>{title}</p>
      {description ? (
        <p className='text-sm text-muted-foreground text-balance'>
          {description}
        </p>
      ) : null}
      {action ? <div className='mt-4'>{action}</div> : null}
    </div>
  );
}

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CHRONIC_THRESHOLD, CHRONIC_WINDOW_DAYS } from "@/lib/constants";
import type { ChronicPattern } from "@/modules/behavior/behavior.service";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export function ChronicPatternBanner({ pattern }: { pattern: ChronicPattern }) {
  const escalateHref = `/incidents/major/new?studentId=${pattern.studentId}&escalateBehaviorRecordIds=${pattern.recordIds.join(",")}`;

  return (
    <Alert variant='destructive'>
      <AlertTriangle />
      <AlertTitle>Chronic minor pattern detected</AlertTitle>
      <AlertDescription className='flex flex-col gap-2'>
        <p>
          This student now has {pattern.count} occurrences of this behavior code
          in the last {CHRONIC_WINDOW_DAYS} days (threshold: {CHRONIC_THRESHOLD}
          +). Consider escalating to a Major Incident report.
        </p>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='w-fit'
          render={<Link href={escalateHref} />}
          nativeButton={false}
        >
          Escalate to Major Incident
        </Button>
      </AlertDescription>
    </Alert>
  );
}

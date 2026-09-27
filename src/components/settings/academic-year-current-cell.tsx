"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { setCurrentAcademicYearAction } from "@/modules/settings/settings.actions";

export function AcademicYearCurrentCell({ id, isCurrent }: { id: string; isCurrent: boolean }) {
  const [isSettingCurrent, startTransition] = useTransition();

  if (isCurrent) return <Badge>Current</Badge>;

  function handleClick() {
    startTransition(async () => {
      try {
        await setCurrentAcademicYearAction(id);
        toast.success("Current academic year updated");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong.");
      }
    });
  }

  return (
    <Button type='button' variant='ghost' size='sm' disabled={isSettingCurrent} onClick={handleClick}>
      Set current
    </Button>
  );
}

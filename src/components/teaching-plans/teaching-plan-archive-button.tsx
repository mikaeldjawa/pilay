"use client";

import { Archive } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { archiveTeachingPlanAction } from "@/modules/teaching-plans/teaching-plan.actions";

export function TeachingPlanArchiveButton({ planId }: { planId: string }) {
  const router = useRouter();
  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline">
          <Archive />
          Archive
        </Button>
      }
      title="Archive this teaching plan?"
      description="The plan is hidden from lists but not deleted. Its weeks, lessons, and materials are preserved."
      confirmLabel="Archive"
      successMessage="Teaching plan archived"
      onConfirm={async () => {
        await archiveTeachingPlanAction(planId);
        router.push("/teaching-plans");
      }}
    />
  );
}

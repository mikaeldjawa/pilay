"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeFollowUpAction } from "@/modules/follow-ups/follow-up.actions";

export function CompleteFollowUpButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        await completeFollowUpAction(id);
        toast.success("Follow-up completed");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong.");
      }
    });
  }

  return (
    <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={handleClick}>
      <CheckCircle2 />
      {isPending ? "Completing..." : "Complete"}
    </Button>
  );
}

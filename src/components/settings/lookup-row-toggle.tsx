"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export function LookupRowToggle({
  id,
  isActive,
  toggleAction,
}: {
  id: string;
  isActive: boolean;
  toggleAction?: (id: string, isActive: boolean) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  function handleCheckedChange(checked: boolean) {
    if (!toggleAction) return;
    startTransition(async () => {
      try {
        await toggleAction(id, checked);
        toast.success(checked ? "Enabled" : "Disabled");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong.");
      }
    });
  }

  return (
    <Switch
      checked={isActive}
      disabled={isPending || !toggleAction}
      onCheckedChange={(checked) => handleCheckedChange(checked === true)}
    />
  );
}

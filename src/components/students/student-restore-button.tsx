"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { restoreStudentAction } from "@/modules/students/student.actions";

export function StudentRestoreButton({ studentId }: { studentId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        await restoreStudentAction(studentId);
        toast.success("Student restored");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong.");
      }
    });
  }

  return (
    <Button variant="outline" disabled={isPending} onClick={handleClick}>
      <RotateCcw />
      {isPending ? "Restoring..." : "Restore"}
    </Button>
  );
}

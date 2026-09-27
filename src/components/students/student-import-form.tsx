"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { StatTile } from "@/components/ui/stat-tile";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  importStudentsAction,
  type ImportStudentsState,
} from "@/modules/students/student.actions";

export function StudentImportForm() {
  const [state, formAction, isPending] = useActionState<ImportStudentsState, FormData>(
    importStudentsAction,
    undefined,
  );

  useEffect(() => {
    if (state?.summary) {
      toast.success(`Imported ${state.summary.created} of ${state.summary.total} students`);
    }
  }, [state]);

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="file">Roster file (.xlsx)</FieldLabel>
            <input
              id="file"
              name="file"
              type="file"
              accept=".xlsx"
              required
              className="text-sm file:mr-3 file:rounded-md file:border file:bg-background file:px-2.5 file:py-1 file:text-sm file:font-medium"
            />
          </Field>
          {state?.error ? (
            <Alert variant="destructive">
              <AlertTitle>{state.error}</AlertTitle>
            </Alert>
          ) : null}
          <Button type="submit" disabled={isPending} className="w-fit">
            <Upload />
            {isPending ? "Importing..." : "Import"}
          </Button>
        </FieldGroup>
      </form>

      {state?.summary ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            <StatTile label="Rows processed" value={state.summary.total} />
            <StatTile label="Created" value={state.summary.created} />
            <StatTile
              label="Failed"
              value={state.summary.failed}
              emphasis={state.summary.failed > 0 ? "attention" : "reference"}
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Row</TableHead>
                <TableHead className="w-28">Status</TableHead>
                <TableHead>Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(state.rowResults ?? []).map((r) => (
                <TableRow key={r.row}>
                  <TableCell className="tabular-nums">{r.row}</TableCell>
                  <TableCell>
                    {r.status === "created" ? (
                      <Badge>Created</Badge>
                    ) : (
                      <Badge variant="destructive">Error</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.status === "created" ? `Student ID ${r.studentId}` : r.message}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </div>
  );
}

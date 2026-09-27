import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LookupRowEditDialog } from "@/components/settings/lookup-row-edit-dialog";
import { LookupRowToggle } from "@/components/settings/lookup-row-toggle";
import { LookupRowDeleteButton } from "@/components/settings/lookup-row-delete-button";
import { LookupCreateForm } from "@/components/settings/lookup-create-form";
import type { ActionState } from "@/modules/students/student.actions";

type LookupRow = {
  id: string;
  code?: string | null;
  name: string;
  description?: string | null;
  isActive?: boolean;
  typeLabel?: string | null;
};

type UpdateAction = (id: string, prevState: ActionState, formData: FormData) => Promise<ActionState>;

export function LookupTableEditor({
  rows,
  hasCode = true,
  codeRequired = false,
  hasDescription = false,
  hasActive = true,
  typeOptions,
  createAction,
  toggleAction,
  updateAction,
  deleteAction,
  entityLabel = "Entry",
}: {
  rows: LookupRow[];
  hasCode?: boolean;
  codeRequired?: boolean;
  hasDescription?: boolean;
  hasActive?: boolean;
  typeOptions?: { value: string; label: string }[];
  createAction: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  toggleAction?: (id: string, isActive: boolean) => Promise<void>;
  updateAction?: UpdateAction;
  deleteAction?: (id: string) => Promise<ActionState>;
  entityLabel?: string;
}) {
  const columnCount =
    1 +
    (hasCode ? 1 : 0) +
    (typeOptions ? 1 : 0) +
    (hasDescription ? 1 : 0) +
    (hasActive ? 1 : 0) +
    (updateAction ? 1 : 0) +
    (deleteAction ? 1 : 0);

  return (
    <div className="flex flex-col gap-3">
      <Table>
        <TableHeader>
          <TableRow>
            {hasCode ? <TableHead className="w-20">Code</TableHead> : null}
            <TableHead>Name</TableHead>
            {typeOptions ? <TableHead>Type</TableHead> : null}
            {hasDescription ? <TableHead>Description</TableHead> : null}
            {hasActive ? <TableHead className="w-16 text-right">Active</TableHead> : null}
            {updateAction ? <TableHead className="w-10" /> : null}
            {deleteAction ? <TableHead className="w-10" /> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              {hasCode ? <TableCell className="text-muted-foreground">{row.code ?? "—"}</TableCell> : null}
              <TableCell>{row.name}</TableCell>
              {typeOptions ? (
                <TableCell>
                  <Badge variant="outline">{row.typeLabel}</Badge>
                </TableCell>
              ) : null}
              {hasDescription ? (
                <TableCell className="text-muted-foreground">{row.description ?? "—"}</TableCell>
              ) : null}
              {hasActive ? (
                <TableCell className="text-right">
                  <LookupRowToggle id={row.id} isActive={row.isActive ?? true} toggleAction={toggleAction} />
                </TableCell>
              ) : null}
              {updateAction ? (
                <TableCell>
                  <LookupRowEditDialog
                    key={`${row.id}:${row.code ?? ""}:${row.name}:${row.description ?? ""}:${row.typeLabel ?? ""}`}
                    row={row}
                    hasCode={hasCode}
                    codeRequired={codeRequired}
                    hasDescription={hasDescription}
                    typeOptions={typeOptions}
                    updateAction={updateAction}
                    entityLabel={entityLabel}
                  />
                </TableCell>
              ) : null}
              {deleteAction ? (
                <TableCell>
                  <LookupRowDeleteButton
                    id={row.id}
                    name={row.name}
                    entityLabel={entityLabel}
                    deleteAction={deleteAction}
                  />
                </TableCell>
              ) : null}
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={columnCount} className="text-center text-muted-foreground">
                No entries yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <LookupCreateForm
        hasCode={hasCode}
        codeRequired={codeRequired}
        hasDescription={hasDescription}
        typeOptions={typeOptions}
        createAction={createAction}
        entityLabel={entityLabel}
      />
    </div>
  );
}

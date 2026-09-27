import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { REPORTING_PERIOD_TYPES } from "@/modules/settings/settings.schema";
import { formatDate } from "@/lib/date";
import { ReportingPeriodEditDialog } from "@/components/settings/reporting-period-edit-dialog";
import { ReportingPeriodCreateForm } from "@/components/settings/reporting-period-create-form";
import { LookupRowDeleteButton } from "@/components/settings/lookup-row-delete-button";
import type { ActionState } from "@/modules/students/student.actions";

type ReportingPeriodRow = {
  id: string;
  name: string;
  periodType: string;
  startDate: Date;
  endDate: Date;
  academicYearId: string;
  academicYear: { name: string };
};

type Option = { id: string; label: string };

export function ReportingPeriodManager({
  periods,
  academicYears,
  deleteAction,
}: {
  periods: ReportingPeriodRow[];
  academicYears: Option[];
  deleteAction: (id: string) => Promise<ActionState>;
}) {
  // Select.Root needs an `items` list to resolve the selected value's label
  // synchronously (on first paint, before the popup has ever been opened) —
  // without it, the trigger falls back to showing the raw id.
  const periodTypeItems = REPORTING_PERIOD_TYPES.map((t) => ({
    value: t,
    label: t.replaceAll("_", " "),
  }));
  const academicYearItems = academicYears.map((y) => ({
    value: y.id,
    label: y.label,
  }));

  return (
    <div className='flex flex-col gap-3'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Academic year</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>End</TableHead>
            <TableHead className='w-10' />
            <TableHead className='w-10' />
          </TableRow>
        </TableHeader>
        <TableBody>
          {periods.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.name}</TableCell>
              <TableCell className='text-muted-foreground'>
                {p.periodType.replaceAll("_", " ")}
              </TableCell>
              <TableCell className='text-muted-foreground'>
                {p.academicYear.name}
              </TableCell>
              <TableCell className='text-muted-foreground'>
                {formatDate(p.startDate)}
              </TableCell>
              <TableCell className='text-muted-foreground'>
                {formatDate(p.endDate)}
              </TableCell>
              <TableCell>
                <ReportingPeriodEditDialog
                  key={`${p.id}:${p.name}:${p.periodType}:${p.academicYearId}:${p.startDate.getTime()}:${p.endDate.getTime()}`}
                  period={p}
                  periodTypeItems={periodTypeItems}
                  academicYearItems={academicYearItems}
                />
              </TableCell>
              <TableCell>
                <LookupRowDeleteButton
                  id={p.id}
                  name={p.name}
                  entityLabel='Reporting period'
                  deleteAction={deleteAction}
                />
              </TableCell>
            </TableRow>
          ))}
          {periods.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className='text-center text-muted-foreground'
              >
                No reporting periods yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <ReportingPeriodCreateForm periodTypeItems={periodTypeItems} academicYearItems={academicYearItems} />
    </div>
  );
}

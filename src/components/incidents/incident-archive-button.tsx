"use client";

import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { archiveIncidentAction } from "@/modules/incidents/incident.actions";

export function IncidentArchiveButton({
  incidentId,
  primaryStudentId,
  incidentNumber,
}: {
  incidentId: string;
  primaryStudentId: string;
  incidentNumber: string;
}) {
  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline">
          <Archive />
          Archive
        </Button>
      }
      title={`Archive ${incidentNumber}?`}
      description="The incident is hidden from lists but not deleted. It stays viewable at this link if you have it."
      confirmLabel="Archive"
      successMessage="Incident archived"
      onConfirm={() => archiveIncidentAction(incidentId, primaryStudentId)}
    />
  );
}

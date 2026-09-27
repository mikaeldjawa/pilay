import { AlertCircle, AlertTriangle, Minus, OctagonAlert, type LucideIcon } from "lucide-react";
import type {
  FollowUpPriority,
  FollowUpStatus,
  IncidentSeverity,
  IncidentStatus,
  ReportStatus,
  RiskLevel,
  SessionStatus,
  StudentStatus,
} from "@/generated/prisma/client";

export type StatusLevel = "neutral" | "warning" | "serious" | "critical";

// True severity/priority fields get the status ramp — color carries meaning
// here (risk of harm), unlike a workflow stage which is just "where a record
// currently sits," not "good" or "bad".
export const RISK_STATUS: Record<RiskLevel, StatusLevel> = {
  LOW: "neutral",
  MODERATE: "warning",
  HIGH: "serious",
  CRITICAL: "critical",
};

export const PRIORITY_STATUS: Record<FollowUpPriority, StatusLevel> = {
  LOW: "neutral",
  NORMAL: "neutral",
  HIGH: "serious",
  CRITICAL: "critical",
};

export const INCIDENT_SEVERITY_STATUS: Record<IncidentSeverity, StatusLevel> = {
  MINOR: "neutral",
  MAJOR: "critical",
};

// Status is never color-alone — every StatusBadge pairs an icon with the
// color, and a StatusBarChart always ships a legend.
export const STATUS_ICON: Record<StatusLevel, LucideIcon> = {
  neutral: Minus,
  warning: AlertTriangle,
  serious: AlertCircle,
  critical: OctagonAlert,
};

export const STATUS_LABEL: Record<StatusLevel, string> = {
  neutral: "Normal",
  warning: "Elevated",
  serious: "High",
  critical: "Critical",
};

// Workflow-stage fields (lifecycle, not severity) stay on plain Badge
// variants — centralized here instead of copy-pasted per page.
type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const STUDENT_STATUS_VARIANT: Record<StudentStatus, BadgeVariant> = {
  ACTIVE: "default",
  INACTIVE: "secondary",
  GRADUATED: "outline",
  TRANSFERRED: "outline",
  WITHDRAWN: "destructive",
};

export const SESSION_STATUS_VARIANT: Record<SessionStatus, BadgeVariant> = {
  OPEN: "default",
  FOLLOW_UP: "outline",
  COMPLETED: "secondary",
  CLOSED: "secondary",
};

export const INCIDENT_WORKFLOW_VARIANT: Record<IncidentStatus, BadgeVariant> = {
  NEW: "default",
  UNDER_INVESTIGATION: "default",
  SUPPORT_PLAN_ACTIVE: "outline",
  MONITORING: "outline",
  RESOLVED: "secondary",
  CLOSED: "secondary",
};

export const FOLLOWUP_WORKFLOW_VARIANT: Record<FollowUpStatus, BadgeVariant> = {
  PENDING: "default",
  IN_PROGRESS: "outline",
  COMPLETED: "secondary",
  CANCELLED: "secondary",
};

export const REPORT_STATUS_VARIANT: Record<ReportStatus, BadgeVariant> = {
  GENERATING: "outline",
  READY: "default",
  FAILED: "destructive",
  ARCHIVED: "secondary",
};

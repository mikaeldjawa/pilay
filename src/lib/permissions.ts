export const PERMISSIONS = {
  STUDENT_READ: "student.read",
  STUDENT_WRITE: "student.write",
  COUNSELING_READ: "counseling.read",
  COUNSELING_WRITE: "counseling.write",
  INCIDENT_READ: "incident.read",
  INCIDENT_WRITE: "incident.write",
  BEHAVIOR_READ: "behavior.read",
  BEHAVIOR_WRITE: "behavior.write",
  FOLLOW_UP_READ: "follow_up.read",
  FOLLOW_UP_WRITE: "follow_up.write",
  GUARDIAN_READ: "guardian.read",
  GUARDIAN_WRITE: "guardian.write",
  REPORT_GENERATE: "report.generate",
  REPORT_DOWNLOAD: "report.download",
  DOCUMENT_READ: "document.read",
  DOCUMENT_UPLOAD: "document.upload",
  TEACHING_PLAN_READ: "teaching_plan.read",
  TEACHING_PLAN_WRITE: "teaching_plan.write",
  ANALYTICS_READ: "analytics.read",
  AUDIT_READ: "audit.read",
  SETTINGS_WRITE: "settings.write",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// MVP has a single role (COUNSELOR) with full access. This map is the seam for
// introducing ADMIN/TEACHER/LEADERSHIP with scoped permission lists later.
const ROLE_PERMISSIONS: Record<string, Permission[] | "*"> = {
  COUNSELOR: "*",
};

export function hasPermission(
  roleName: string | undefined | null,
  permission: Permission,
): boolean {
  if (!roleName) return false;
  const grants = ROLE_PERMISSIONS[roleName];
  if (!grants) return false;
  return grants === "*" || grants.includes(permission);
}

export function requirePermission(
  roleName: string | undefined | null,
  permission: Permission,
): void {
  if (!hasPermission(roleName, permission)) {
    throw new Error(`Forbidden: missing permission "${permission}"`);
  }
}

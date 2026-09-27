// Formalizes the PRD's 4-level sensitivity classification as an entity→level
// map. MVP has a single COUNSELOR role with full access, so this doesn't gate
// anything yet — it's the seam for RBAC-by-sensitivity-level checks
// (src/lib/permissions.ts) once ADMIN/TEACHER/LEADERSHIP roles exist, and it
// generalizes the "never surface note text on the dashboard" rule from
// src/modules/analytics/analytics.service.ts into a reusable classification.

export const SENSITIVITY_LEVELS = {
  GENERAL: 1, // basic student info: name, grade, class
  BEHAVIORAL: 2, // incidents, behavior records
  COUNSELING: 3, // counseling sessions and notes
  SAFEGUARDING: 4, // crisis-risk sessions, highly sensitive documents
} as const;

export type SensitivityLevel = (typeof SENSITIVITY_LEVELS)[keyof typeof SENSITIVITY_LEVELS];

const ENTITY_SENSITIVITY: Record<string, SensitivityLevel> = {
  student: SENSITIVITY_LEVELS.GENERAL,
  behavior_record: SENSITIVITY_LEVELS.BEHAVIORAL,
  incident: SENSITIVITY_LEVELS.BEHAVIORAL,
  counseling_session: SENSITIVITY_LEVELS.COUNSELING,
  counseling_note: SENSITIVITY_LEVELS.COUNSELING,
  generated_report: SENSITIVITY_LEVELS.COUNSELING,
};

export function sensitivityOf(entityType: string): SensitivityLevel {
  return ENTITY_SENSITIVITY[entityType] ?? SENSITIVITY_LEVELS.COUNSELING;
}

// Anything at COUNSELING level or above must never render as free text
// outside the case record itself (dashboards, notifications, analytics).
export function isFreeTextSafeToSurface(entityType: string): boolean {
  return sensitivityOf(entityType) < SENSITIVITY_LEVELS.COUNSELING;
}

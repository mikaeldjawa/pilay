import { esc } from "@/modules/reports/renderers/shared/html";

// Compact numeric date — used by the form-style templates (major incident,
// minor behavior log).
export function formatDateShort(date?: Date | string | null): string {
  if (!date) return "";

  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(date?: Date | null): string {
  if (!date) return "";

  return date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Long prose-style date — used by the narrative-style template (counseling
// case report). Deliberately distinct from formatDateShort, not a duplicate:
// the two report styles use different date formats by design.
export function formatDateLong(value: unknown): string {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return displayValueOrDash(value);

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(value: unknown): string {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

// Escaped value, or "" when empty — used by the form-style templates.
export function displayValue(input: unknown): string {
  if (input === null || input === undefined || input === "") return "";
  return esc(String(input));
}

// Escaped value, or an em-dash when empty — used by the narrative-style
// template. Deliberately distinct from displayValue, not a duplicate.
export function displayValueOrDash(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  return esc(String(value));
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Prisma } from "@/generated/prisma/client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// The one place a student's full name gets built — "First [Middle] Last",
// never a "Last, First" comma format. Every display site in the app should
// call this instead of concatenating firstName/lastName itself.
export function formatStudentName(student: {
  firstName: string
  middleName?: string | null
  lastName?: string | null
}): string {
  return [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ")
}

// Full-name search that actually matches a multi-word query. A plain
// per-field `contains` can never match a two-word search like "John Smith"
// against firstName="John"/lastName="Smith", since neither field alone
// contains the full string — so this splits on whitespace and requires
// every token to match *some* name field (AND of ORs).
export function studentNameSearchFilter(search: string): Prisma.StudentWhereInput {
  const tokens = search.trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return {}
  return {
    AND: tokens.map((token) => ({
      OR: [
        { firstName: { contains: token, mode: "insensitive" as const } },
        { middleName: { contains: token, mode: "insensitive" as const } },
        { lastName: { contains: token, mode: "insensitive" as const } },
      ],
    })),
  }
}

// Lookup lists shown in a <Select>/<Combobox> are usually filtered to
// isActive rows, but an edit form's current value can point at a row that's
// since been deactivated. Left unmerged, the picker can't find a matching
// option for that id and silently falls back to rendering the raw id as
// text. Call this with the base (active-only) list plus whatever the record
// being edited currently references, so that value always has a match.
export function mergeOptionalOptions<T extends { id: string }>(
  base: T[],
  extra: (T | null | undefined)[],
): T[] {
  const result = [...base]
  const seenIds = new Set(base.map((item) => item.id))
  for (const item of extra) {
    if (item && !seenIds.has(item.id)) {
      result.push(item)
      seenIds.add(item.id)
    }
  }
  return result
}

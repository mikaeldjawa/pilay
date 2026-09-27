import { Prisma } from "@/generated/prisma/client";

// @prisma/adapter-pg nests the violated constraint's column names under
// error.meta.driverAdapterError.cause.constraint.fields instead of the
// classic error.meta.target — check both so this works regardless of driver.
export function uniqueConstraintFields(error: unknown): string[] {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") return [];
  const meta = error.meta as Record<string, unknown> | undefined;
  if (!meta) return [];
  if (Array.isArray(meta.target)) return meta.target as string[];
  if (typeof meta.target === "string") return [meta.target];
  const driverError = meta.driverAdapterError as Record<string, unknown> | undefined;
  const cause = driverError?.cause as Record<string, unknown> | undefined;
  const constraint = cause?.constraint as Record<string, unknown> | undefined;
  if (Array.isArray(constraint?.fields)) return constraint.fields as string[];
  return [];
}

export function isUniqueConstraintViolation(error: unknown, fieldSubstring?: string): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") return false;
  if (!fieldSubstring) return true;
  return uniqueConstraintFields(error).join(",").includes(fieldSubstring);
}

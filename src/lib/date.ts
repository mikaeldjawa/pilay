const DAY_MS = 86400000;

export function daysAgo(days: number): Date {
  return new Date(Date.now() - days * DAY_MS);
}

export function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * DAY_MS);
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

// Pinned locale + UTC so a date-only value (e.g. a Prisma @db.Date column)
// formats identically regardless of the server's or the browser's local
// timezone/locale. Use this in any Client Component rendering a Date from
// the DB — an unpinned toLocaleDateString() there is a hydration-mismatch
// hazard, since SSR (Node) and hydration (browser) can compute different
// strings for the same Date.
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { timeZone: "UTC" });
}

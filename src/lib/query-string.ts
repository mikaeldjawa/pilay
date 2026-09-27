export type SearchParams = Record<string, string | string[] | undefined>;

// Merges the current page's searchParams with a set of overrides and returns
// a full href. A key present in `overrides` (even with an undefined/empty
// value) is dropped from the current params first, then re-added only if its
// override value is non-empty — this is what lets sort/filter/page links
// compose instead of clobbering each other.
export function buildHref(
  pathname: string,
  current: SearchParams,
  overrides: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(current)) {
    if (key in overrides) continue;
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) params.append(key, v);
    } else {
      params.set(key, value);
    }
  }

  for (const [key, value] of Object.entries(overrides)) {
    if (!value) continue;
    params.set(key, value);
  }

  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

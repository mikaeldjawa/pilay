// Appends a one-shot success message to a redirect target as a query param,
// so the destination page (which the redirecting action's own component
// never gets to re-render, since it navigates away) can show it instead.
// See src/components/layout/flash-toast.tsx for the consuming side.
export function withSuccessFlash(path: string, message: string): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}success=${encodeURIComponent(message)}`;
}

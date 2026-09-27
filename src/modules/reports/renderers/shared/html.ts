// Plain string-template HTML builders for report PDFs (no React/react-dom-server
// dependency — Next.js flags react-dom/server as unreachable from anything a
// "use server" action file might expose to the client bundle graph).

export function esc(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

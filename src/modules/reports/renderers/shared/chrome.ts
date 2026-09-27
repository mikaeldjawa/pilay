export function chromeBar(params: {
  left?: string;
  right?: string;
  border?: "top" | "bottom";
  borderColor?: string;
  sidePadding?: string;
  textColor?: string;
}) {
  const borderStyle = !!params.border
    ? params.border === "top"
      ? "border-top"
      : "border-bottom"
    : ``;
  const borderPadding = !!params.border
    ? params.border === "top"
      ? "padding-top"
      : "padding-bottom"
    : ``;
  const textColor = params.textColor ?? "#666";

  return `<div style="width:100%;font-family:Arial,sans-serif;font-size:7.5pt;color:${textColor};padding:0 ${params.sidePadding ?? ``};display:flex;justify-content:space-between;${borderStyle}:1.5px solid ${params.borderColor ?? ``};${borderPadding}:2px;">
  ${!!params.left ? `<span>${params.left}</span>` : ``}
    ${!!params.right ? `<span>${params.right}</span>` : ``}
  </div>`;
}

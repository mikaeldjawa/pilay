import { chromeBar } from "@/modules/reports/renderers/shared/chrome";
import { esc } from "@/modules/reports/renderers/shared/html";

const ACCENT = "#00a651";
const SIDE_PADDING = "16mm";

export function renderMinorBehaviorLogHeader(params: {
  schoolName: string;
  reportNumber: string;
}) {
  return chromeBar({
    left: esc(params.schoolName),
    right: esc(params.reportNumber),
    border: "bottom",
    borderColor: ACCENT,
    sidePadding: SIDE_PADDING,
  });
}

export function renderMinorBehaviorLogFooter(params: { footerNotice: string }) {
  return chromeBar({
    left: esc(params.footerNotice),
    right: `Page <span class="pageNumber"></span> of <span class="totalPages"></span>`,
    border: "top",
    borderColor: ACCENT,
    sidePadding: SIDE_PADDING,
  });
}

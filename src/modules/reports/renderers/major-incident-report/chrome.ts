import { chromeBar } from "@/modules/reports/renderers/shared/chrome";
import { esc } from "@/modules/reports/renderers/shared/html";

const ACCENT = "#ff002b";
const SIDE_PADDING = "14mm";

export function renderMajorIncidentHeader(params: {
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

export function renderMajorIncidentFooter(params: { footerNotice: string }) {
  return chromeBar({
    left: esc(params.footerNotice),
    right: `Page <span class="pageNumber"></span> of <span class="totalPages"></span>`,
    border: "top",
    borderColor: ACCENT,
    sidePadding: SIDE_PADDING,
  });
}

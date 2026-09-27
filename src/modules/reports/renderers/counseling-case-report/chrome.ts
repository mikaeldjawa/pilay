import { chromeBar } from "@/modules/reports/renderers/shared/chrome";
import { esc } from "@/modules/reports/renderers/shared/html";
import { renderPrivacyNotice } from "./sections";
import { COUNSELING_CASE_CSS } from "./styles";

const SIDE_PADDING = "14mm";

export function renderCounselingCaseHeader(params: {
  schoolName: string;
  reportNumber: string;
}) {
  return chromeBar({
    left: `
     <style>${COUNSELING_CASE_CSS}</style>
    ${renderPrivacyNotice()}`,
    sidePadding: SIDE_PADDING,
  });
}

export function renderCounselingCaseFooter(params: { footerNotice: string }) {
  return chromeBar({
    left: esc(params.footerNotice),
    right: `Page <span class="pageNumber"></span> of <span class="totalPages"></span>`,
    sidePadding: SIDE_PADDING,
  });
}

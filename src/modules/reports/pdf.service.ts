import type { Browser } from "playwright-core";

// Vercel's serverless functions have no locally-installed Chromium (that
// only exists where `playwright install chromium` has been run, i.e. local
// dev). In that environment, launch @sparticuz/chromium's prebuilt Lambda
// binary through playwright-core instead of the full `playwright` package.
async function launchBrowser(): Promise<Browser> {
  const isServerless = Boolean(process.env.VERCEL) || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

  if (isServerless) {
    const [{ chromium }, { default: chromiumBinary }] = await Promise.all([
      import("playwright-core"),
      import("@sparticuz/chromium"),
    ]);
    return chromium.launch({
      args: chromiumBinary.args,
      executablePath: await chromiumBinary.executablePath(),
      headless: true,
    });
  }

  const { chromium } = await import("playwright");
  return chromium.launch();
}

export async function renderHtmlToPdf(
  html: string,
  landscape: boolean,
  chrome: { headerTemplate: string; footerTemplate: string },
): Promise<Buffer> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });

    // Margin is the single source of truth for page margins (see
    // report-document.ts) — top and bottom each reserve room for the
    // repeating header/footer bar Playwright draws outside the page content.
    const margin = landscape
      ? { top: "20mm", right: "16mm", bottom: "20mm", left: "16mm" }
      : { top: "22mm", right: "14mm", bottom: "22mm", left: "14mm" };

    const pdf = await page.pdf({
      format: "A4",
      landscape,
      printBackground: true,
      margin,
      displayHeaderFooter: true,
      headerTemplate: chrome.headerTemplate,
      footerTemplate: chrome.footerTemplate,
    });
    return pdf;
  } finally {
    await browser.close();
  }
}
